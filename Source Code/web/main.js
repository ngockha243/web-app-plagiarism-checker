
document.getElementById("wordcount").innerHTML = "0";


function deleteData(){
  $("textarea").val('');
  $("textarea").trigger('click');
  $("textarea").focus();
}

function countWord() {
  var words = document
      .getElementById("data").value;
  var count = 0;
  var split = words.split(/[\s]+/);
  for (var i = 0; i < split.length; i++) {
      if (split[i] != "") {
          count += 1;
          
      }
      
  }
  $("#wordcount").text(count);
  if (count > 1000){
    $(".bton").attr("disabled", true);
    $("#wordcount").addClass('text-danger');
    $("#wordcount").addClass('blink_me');
    $("textarea").addClass('border-danger');
    // $('<div class="alert alert-danger">Success!</div>').insertBefore('#error').delay(3000).fadeOut();
  }
  else {
    $(".bton").attr("disabled", false);
    $("#wordcount").removeClass('text-danger');
    $("#wordcount").removeClass('blink_me');
    $("textarea").removeClass('border-danger');
    
  }
}

async function getData() {
  var data = document.getElementById("data").value;
  if (data.length == 0) {
    alert("Hãy nhập đầy đủ thông tin");
    $("textarea").trigger('click');
    $("textarea").focus();
  }
  else {
    $("textarea").attr("disabled", true);
    $("textarea").addClass("loading");
    $(".loading-icon").removeClass("hide");
    $(".bton").attr("disabled", true);
    $(".kiemtra").text("Kiểm tra...");
    document.getElementById("num-sent").innerHTML = '';
    document.getElementById("result").innerHTML = '';
    document.getElementById("download").innerHTML = '';
    var result = await eel.process(data)();
    var sent = result[0];
    var link = result[1];
    var perc = result[2];
    var all_percent = result[3];

    var mytable = "<table class=\"table table-bordered shadow-lg p-3 mb-3 bg-white botron\"><thead><tr><th width=\"10px\" scope=\"col\">STT</th><th width=\"450px\" scope=\"col\">Câu văn</th><th width=\"200px\" scope=\"col\">Link</th><th width=\"100px\" scope=\"col\">Phần trăm</th></tr></thead><tbody>";


    for (var i = 0; i < sent.length; i++) {
      mytable += "<tr>";
      var ind = i+1;
      var per = Math.round(perc[i]*100);
      mytable +=  "<td>"+ind+ "</td> ";
      mytable +=  "<td class=\"text-justify\">"+sent[i] + "</td> ";
      mytable +=  "<td class=\"text text-left\"><a href='"+ link[i] + "' target=\"_blank\">" +link[i] + "</a></td>";
      mytable +=  "<td>"+ per + " %</td>";
      mytable +=  "</tr>";
    }
    var total = Math.round(all_percent*100);
    var none = 100 - total;
    

    string_total = "<h2>KẾT QUẢ</h2><div class=\"d-flex justify-content-center\"><div class=\"ngang\"><label class=\"text-left text-success daovan\">KHÔNG ĐẠO VĂN</label></div>  <div role=\"progressbar-green\" aria-valuenow=\"50\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"--value:"+none+"\"></div><div role=\"progressbar-red\" aria-valuenow=\"50\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"--value:" + total+"\"></div><div class=\"ngang\"><label class=\"text-right text-danger daovan\">ĐẠO VĂN</label></div></div>";
    
    mytable += "</tbody></table>";

    download = "<button id=\"button\" class=\"btn btn-grad-red col-xl-2 col-lg-4 col-md-4 col-4 btn-grid upload rounded-pill\" onclick=\"window.print()\"><label><i class=\"fa fa-download \"></i><span>Tải file PDF</span></label></button>"  
    
    document.getElementById("result").innerHTML = string_total;
    document.getElementById("download").innerHTML = download;
 

    if (total == 0){
      document.getElementById("num-sent").innerHTML = '';
    }
    else{
      document.getElementById("num-sent").innerHTML = mytable;
    }
    window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" });
    

    
    $(".loading-icon").addClass("hide");
    $(".kiemtra").text("Kiểm tra");
    $(".bton").attr("disabled", false);
    $("textarea").attr("disabled", false);
    $("textarea").removeClass("loading");
  }
 
}


$(document).bind("contextmenu",function(e){
  return false;
    });

function getFile(){
  var filename = document.getElementById("file").files[0].name;
  var ext = filename.split('.').pop();
  if (ext == "txt"){
    loadFileAsText();
  }
  else {
    gettext();
  }
}    

function loadFileAsText(){
  var fileToLoad = document.getElementById("file").files[0];

  var fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
      var textFromFileLoaded = fileLoadedEvent.target.result;
      $("textarea").val(textFromFileLoaded);
      $("textarea").trigger('click');
      $("textarea").focus();
  };
  fileReader.readAsText(fileToLoad, "UTF-8");
}


function loadFile(url, callback) {
  PizZipUtils.getBinaryContent(url, callback);
}
function gettext() {
    loadFile(
      URL.createObjectURL(document.getElementById("file").files[0]),
        function (error, content) {
            if (error) {
                alert(error) ;
            }
            var zip = new PizZip(content);
            var doc = new window.docxtemplater(zip);
            var text = doc.getFullText();
            $("textarea").val(text);
            $("textarea").trigger('click');
            $("textarea").focus();
        }
    );
}

var button = document.getElementById("button");
button.addEventListener("click", function () {
  var doc = new jsPDF("p", "mm", [300, 300]);
  var makePDF = document.querySelector("#makepdf");

  // fromHTML Method
  doc.fromHTML(makePDF);
  doc.save("output.pdf");
});