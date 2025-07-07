let currentSong = new Audio();
let songs;
let currFolder;
let previous = document.getElementById("previous");
let next = document.getElementById("next");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    if (secs < 10) {
        secs = "0" + secs;
    }

    return `${minutes}:${secs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let responce = await a.text();
    let div = document.createElement("div");
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a");

    songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/").pop().replaceAll("%20", " ",));
        }

    }
    let songUl = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> <img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="images/play.svg" alt="">
                            </div> </li>`;
    }

    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
            document.querySelector(".volume").classList.remove("none");
        });
    });

    return songs;
}

const playMusic = (track) => {
    currentSong.src = `/${currFolder}/` + track;
    currentSong.play();
    play.src = "images/pause.svg"
    document.querySelector(".song-info").innerHTML = track;
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00"

}


async function main() {
    // get the list of songs
    await getSongs("songs/romantic");

    // Attach for play, next and prvious song:
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    //listen for time-update

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add an event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // add an event listener to hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })


    // add an event listener to close left

    document.querySelector(".close").lastElementChild.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    // add an event listener to previous and next

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop().replaceAll("%20", " "));

        if (index <= 0) {
            playMusic(songs[songs.length - 1]);
        }
        else {
            playMusic(songs[index - 1]);
        }

    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop().replaceAll("%20", " ")); //split will divide the src into arrays(e.g. sss/sss/aaa split will make it sss, sss, aaa), pop() selects the last element, replace will replace %20 with " ";

        if (index >= songs.length - 1) {
            playMusic(songs[0]);
        }
        else {
            playMusic(songs[index + 1]);
        }

    });

    // Add an event to volume

    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value)/100;
    })

    //Load the playlist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            
        })
    })

    document.querySelector(".volume>img").addEventListener("click", (e)=> {
        if(e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("images/volume.svg", "images/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("images/mute.svg", "images/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main();

