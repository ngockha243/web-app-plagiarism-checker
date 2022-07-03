import eel
from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from nltk.tokenize import word_tokenize, sent_tokenize
import requests
import string
from bs4 import BeautifulSoup
eel.init('web')


@eel.expose

# xoa ky tu dac biet
def remove_punc(s):
    exclude = set(string.punctuation)
    for i in exclude:
        if i != '.' and i != '?' and i != '!':
            s = s.replace(i, '')
    s = s.replace('?','.')
    s = s.replace('!','.')
    s = s.replace("…",'.')
    s = s.replace("...",'.')
    s = s.replace("''",'')
    s = s.replace('``','')
    return s

@eel.expose
def process(text):
    print("Processing: ")
    
    #xoa ky tu dac biet
    text = remove_punc(text)
    word_list = []

    #tach cau bang tokenize
    sent_list = sent_tokenize(text)

    for sent in sent_list:
        word_list += sent_tokenize(sent)
    word_list = [i for i in word_list]
    
    #searchgoogle
    try:
        from googlesearch import search
    except ImportError:
        print("No module named 'google' found")
    #crawl data
    data = []
    print(word_list)
    #number of link per sentences
    num_link_per_sent = 1
    #array of link
    links = ['' for i in range(len(word_list)*num_link_per_sent)]
    #link duplicate
    link_dup = [0 for i in range(len(word_list)*num_link_per_sent)]
    # print(links, link_dup)

    try:
        for i in range(len(word_list)):
            for link in search(word_list[i], tld="co.in", num=10, stop=num_link_per_sent, pause=1):

                for j in range(num_link_per_sent):
                    if(link in links):

                        #danh dau link duplicate
                        link_dup[num_link_per_sent*i+j] = 1
                    #get link
                    links[num_link_per_sent*i+j] = link
                    
        #crawl data
        for i in range(len(links)):
            if link_dup[i] == 0:
                page = requests.get(links[i])
                soup = BeautifulSoup(page.content, 'html.parser')

                #Lấy data từ thẻ p
                for element in soup.select('p'):
                    data.append(element.text)
                #Lấy data từ thẻ pre
                for element in soup.select('pre'):
                    data.append(element.text)
                #Lấy data từ thẻ span
                for element in soup.select('span'):
                    data.append(element.text)
                #Lấy data từ thẻ h1
                for element in soup.select('h1'):
                    data.append(element.text)
                #Lấy data từ thẻ h2
                for element in soup.select('h2'):
                    data.append(element.text)
        # print(links, link_dup)
    except:
        print("Search limited. Please try another time or change your IP address.")


    #sentences plagiarism
    plagi = []
    #link of sentences
    link_pla = []
    #percent of plagiarism
    percent = []
    all_percent = 0
    try:
        #training data

        #Trinh bay 1 tai lieu cung voi 1 tag, dinh dang tai lieu input cho Doc2Vec
        tagged_data = [TaggedDocument(words=word_tokenize(_d.lower()), tags=[str(i)]) for i, _d in enumerate(data)]
        #
        max_epochs = 100
        #So chieu cua vector
        vec_size = 50
        #Ti le learning ban dau
        alpha = 0.025

        #Tao model Doc2Vec
        model = Doc2Vec(vector_size =vec_size, #so chieu vector
                        alpha=alpha, #learning rate ban dau
                        min_alpha=0.00025, #ty le learning giam tuyen tinh xuong minAlpha khi training
                        min_count=1, #Loc bo tat ca tu khoi dicionary co so lan xuat hien < minCount
                        dm =1) #DM = 1: PV-DM, DM = 0: PV-DBOW

        #Xay dung von tu vung tu chuoi tai lieu
        model.build_vocab(tagged_data)

        for epoch in range(max_epochs):
            # print('iteration {0}'.format(epoch))
            #training
            model.train(tagged_data,
                        total_examples=model.corpus_count,  #So luong tai lieu
                        epochs=10)  #So lan training
            #giam learning rate
            model.alpha -= 0.0002
            #fix the learning rate, no decay
            model.min_alpha = model.alpha
        #save model
        model.save("d2v.model")
        print("Model Saved")

        #load model
        model= Doc2Vec.load("d2v.model")

        # print(word_list)
        # print(links)
        # print(link_pla)
        #plagiarism
        
        for i in range(len(word_list)):
            #tokenize cau can so sanh
            test_data = word_tokenize(word_list[i])
            #Suy vector cho cau input from mo hinh training
            v1 = model.infer_vector(test_data)
            #Tra ve tap thu hang trung lap
            similar_doc = model.dv.most_similar([v1])

            #Do trung lap > 70% --> Dao van
            if(similar_doc[0][1] > 0.7):
                # print(similar_doc[0][0])
                #Xuat cau dao van
                plagi.append(word_list[i].lower())
                # print(plagi)
                #Xuat link dao van
                link_pla.append(links[i*num_link_per_sent])
                
                # print(link_pla)
                #Xuat phan tram dao van
                percent.append(similar_doc[0][1])
                
                # print(percent)
                all_percent += similar_doc[0][1]
                # print(all_percent)
        #Xuat tong phan tram dao van
        all_percent = all_percent/float(len(word_list))
    except:
        print('something went wrong. please try again')
    print("Done")
    return [plagi, link_pla, percent, all_percent]


eel.start('index.html', mode='edge', port=8000, size=(1000, 600))