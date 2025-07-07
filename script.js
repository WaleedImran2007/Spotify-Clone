let currentSong = new Audio();
let songs;
let currFolder;
let previous = document.getElementById("previous");
let next = document.getElementById("next");

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds)) return "00:00";
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    if (secs < 10) secs = "0" + secs;
    return `${minutes}:${secs}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${folder}/`); // Changed from hardcoded localhost
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/").pop().replaceAll("%20", " "));
        }
    }

    let songUl = document.querySelector(".song-list ul");
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `
        <li>
            <img class="invert" src="images/music.svg" alt="">
            <div class="info">
                <div>${song}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="images/play.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(songUl.getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info div").innerText.trim());
            document.querySelector(".volume").classList.remove("none");
        });
    });

    return songs;
}

function playMusic(track) {
    currentSong.src = `${currFolder}/` + track;
    currentSong.play();
    play.src = "images/pause.svg";
    document.querySelector(".song-info").innerText = track;
    document.querySelector(".song-time").innerText = "00:00 / 00:00";
}

async function main() {
    await getSongs("songs/romantic");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").lastElementChild.addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop().replaceAll("%20", " "));
        playMusic(index <= 0 ? songs[songs.length - 1] : songs[index - 1]);
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop().replaceAll("%20", " "));
        playMusic(index >= songs.length - 1 ? songs[0] : songs[index + 1]);
    });

    document.querySelector(".volume input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]); // Auto play first song in album
        });
    });

    document.querySelector(".volume > img").addEventListener("click", (e) => {
        const img = e.target;
        const input = document.querySelector(".volume input");
        if (img.src.includes("volume.svg")) {
            img.src = img.src.replace("images/volume.svg", "images/mute.svg");
            currentSong.volume = 0;
            input.value = 0;
        } else {
            img.src = img.src.replace("images/mute.svg", "images/volume.svg");
            currentSong.volume = 0.1;
            input.value = 10;
        }
    });
}

main();
