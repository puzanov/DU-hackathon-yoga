let video = document.querySelector("video");
let recordBtnContainer = document.querySelector(".record-btn-container");
let captureBtnContainer = document.querySelector(".capture-btn-container");
let recordBtn = document.querySelector(".record-btn");
let captureBtn = document.querySelector(".capture-btn");
let recordFlag = false;
let transparentColor = "transparent";
let recorder;
let audio = new Audio('yoga.mp3');
let minVol = 0.1;
let maxVol = 0.6;
audio.play();
audio.volume = maxVol;

let constraints = {
    video: true,
    audio: false
}

let chunks = [];


navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    video.srcObject = stream
    recorder = new MediaRecorder(stream);

    recorder.addEventListener("start", (e) => {
        chunks = [];
    })
    recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
    })
    recorder.addEventListener("stop" , (e) => {
        // conversion of media chunks to video
        let blob = new Blob(chunks, {type: "video/mp4"});
        if(db){
            let videoId = shortid();
            let dbTransaction = db.transaction("video", "readwrite");
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
                id: `vid-${videoId}`,
                blobData: blob
            }
            videoStore.add(videoEntry)
        }

    })
})

captureBtnContainer.addEventListener('click', async (e) => {
    audio.volume = maxVol;
    console.log("Stand in a posture");
    document.getElementById('banner').innerHTML = "Stand in a yoga posture"
    document.getElementById('banner').style.display = "block";
    setTimeout(processPicture, 5000);
})

async function processPicture() {
    console.log("Processing the posture\n\n\n\n\nProcessing the posture\n\n\n\nProcessing the posture");
    
    document.getElementById('banner').innerHTML = "Processing the posture"
    document.getElementById('banner').style.display = "block";

    captureBtn.classList.add("scale-capture");

    let canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    let tool = canvas.getContext('2d');
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);

    //Filtering
    tool.fillStyle = transparentColor;
    tool.fillRect(0, 0, canvas.width, canvas.height);

    //let imageURL = canvas.toDataURL("image/jpeg");
    let imageURL = canvas.toDataURL("image/jpeg");

    let imageBlob = dataURItoBlob(imageURL);

    // document.getElementById('myFile').value=imageURL
    //let form = document.getElementById("yogaform");
    //var formDataToUpload = new FormData();
    
    //var blob = dataURLtoBlob(dataurl);
    var fd = new FormData();
    fd.append("yogaimage", imageBlob, "filename.jpg");

    try {
        const res = await fetch(
          'http://localhost:5000/upload',
          {
            method: 'POST',
            body: fd,
          },
        );
        const resData = await res.json();

        audio.volume = minVol;

        console.log(resData.result.answer);

        document.getElementById('banner').innerHTML = resData.result.answer
        document.getElementById('banner').style.display = "block";

        window.speechSynthesis.cancel();

        let utterance = new SpeechSynthesisUtterance();

        utterance.lang = 'en-US';
        utterance.text = resData.result.answer;
        utterance.voice = window.speechSynthesis.getVoices()[2];
        prolongLongText(utterance);
        window.speechSynthesis.speak(utterance);
        utterance.addEventListener("end", (event) => {
            audio.volume = maxVol
            document.getElementById('banner').style.display = "hidden";
        });
        
      } catch (err) {
        console.log(err.message);
        errText = "Probably this is not a yoga pose. Please try again";
        console.log(errText);

        document.getElementById('banner').innerHTML = errText
        document.getElementById('banner').style.display = "block";

        audio.volume = minVol;

        window.speechSynthesis.cancel();

        let utterance = new SpeechSynthesisUtterance();

        utterance.lang = 'en-US';
        utterance.text = errText;
        utterance.voice = window.speechSynthesis.getVoices()[3];
        prolongLongText(utterance);
        window.speechSynthesis.speak(utterance);

        utterance.addEventListener("end", (event) => {
            document.getElementById('banner').style.display = "hidden";
            audio.volume = maxVol
        });

    }

    // var xhr = new XMLHttpRequest();
    // xhr.open('POST', 'http://localhost:5000/upload', true);
    // xhr.onload = function(res){
    //     console.log(res);
    // };
    // xhr.send(fd);

    // let ff = new File([imageURL], "filename.jpg");    
    // formDataToUpload.append("yogaimage", ff);
    
    // console.log(ff);
    
    //formDataToUpload.append("yogaimage", imageBlob, "filename.jpg");
    
    //console.log(formDataToUpload.values()[0]);

    //form.submit();

    // if(db){
    //     let imageId = shortid();
    //     let dbTransaction = db.transaction("image", "readwrite");
    //     let imageStore = dbTransaction.objectStore("image");
    //     let imageEntry = {
    //         id: `img-${imageId}`,
    //         url: imageURL
    //     }
    //     imageStore.add(imageEntry)
    // }

    // setTimeout(() => {
    //     captureBtn.classList.remove("scale-capture");
    // }, 500)
}

let timerId, counter = 0;
let timer = document.querySelector(".timer");
function startTimer(){
    timer.style.display = "block";
    function displayTimer(){
        let seconds = counter;

        let hours = Number.parseInt(seconds/3600);
        seconds %= 3600;

        let minutes = Number.parseInt(seconds/60);
        seconds %= 60;

        hours = (hours < 10) ? `0${hours}` : hours;
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;

        timer.innerText = `${hours}:${minutes}:${seconds}`;

        counter++;
    }
    timerId = setInterval(displayTimer, 1000)
}

function stopTimer(){
    clearInterval(timerId)
    timer.innerText = "00:00:00"
    timer.style.display = "none";
}
//filtering logic
let allFilters = document.querySelectorAll('.filter');
let filterLayerContainer = document.querySelector('.filter-layer');
allFilters.forEach((filter) => {
    filter.addEventListener('click', (e) => {
        transparentColor = getComputedStyle(filter).getPropertyValue('background-color');
        filterLayerContainer.style.backgroundColor = transparentColor;
    })
})

function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    var byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    //Old Code
    //write the ArrayBuffer to a blob, and you're done
    //var bb = new BlobBuilder();
    //bb.append(ab);
    //return bb.getBlob(mimeString);

    //New Code
    return new Blob([ab], {type: mimeString});
}

function prolongLongText(utterance) {
    let timer;
  
    const clear = () => {
      clearTimeout(timer);
    };
  
    utterance.onstart = () => {
      resumeInfinity(utterance);
    };
  
    utterance.onerror = clear;
    utterance.onend = clear;
  
    const resumeInfinity = (target) => {
      // prevent memory-leak in case utterance is deleted, while this is ongoing
      if (!target && timer) {
        return clear();
      }
  
      speechSynthesis.pause();
      speechSynthesis.resume();
  
      timer = setTimeout(function () {
        resumeInfinity(target);
      }, 5000);
    };
  }
