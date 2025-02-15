document.addEventListener("DOMContentLoaded", function () {
let CurrentSong = new Audio();
let Songs;
let currFolder;
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    // Round down to the nearest second
    seconds = Math.floor(seconds);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad with leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;

    try {
        // Fetch the JSON file that contains all song data
        let response = await fetch("https://insaiyanbruh.github.io/Vibify/Songs/songs.json");

        // Check if the response is valid
        if (!response.ok) {
            throw new Error(`Failed to fetch songs.json: ${response.status} ${response.statusText}`);
        }

        let data = await response.json();

        // Debugging logs
        console.log("Fetched JSON Data:", data);
        console.log("Looking for folder:", folder);

        // Ensure the folder exists in songs.json
        if (!data.hasOwnProperty(folder)) {
            console.error(`❌ Folder "${folder}" not found in songs.json`);
            return [];
        }

        Songs = data[folder];

        // Ensure songs exist in the folder
        if (!Array.isArray(Songs) || Songs.length === 0) {
            console.error(`❌ No songs found in folder "${folder}"`);
            return [];
        }

        console.log("✅ Loaded Songs:", Songs);

        let songUL = document.querySelector(".SongList ul");
        if (!songUL) {
            console.error("❌ .SongList ul not found in DOM");
            return [];
        }

        songUL.innerHTML = "";

        // Loop through songs and add them to the list
        Songs.forEach(song => {
            let songName = song.replaceAll("%20", " "); // Decode name
            songUL.innerHTML += `
                <li>
                    <img class="Invert" src="Images/Music.svg" alt="">
                    <div class="SongInfo">
                        <div>${songName}</div>
                        <div></div>
                    </div>
                    <div class="PlayNow">
                        <i class="ri-play-fill"></i>
                    </div>
                </li>`;
        });

        // Attach click event listeners to play songs
        document.querySelectorAll(".SongList li").forEach(e => {
            e.addEventListener("click", () => {
                let trackName = e.querySelector(".SongInfo div").innerText.trim();
                PlayMusic(trackName);
            });
        });

        return Songs;

    } catch (error) {
        console.error("❌ Error in getSongs():", error);
        return [];
    }
}

let PlayMusic = (Track, pause = false) => {
    if (!Track) {
        console.error("❌ No track name provided to PlayMusic()");
        return;
    }

    let songPath = `https://insaiyanbruh.github.io/Vibify/Songs/${currFolder}/${Track}`;

    console.log("🎵 Trying to play:", songPath);

    CurrentSong.src = songPath;
    CurrentSong.load(); // Ensure the audio is reloaded

    Play.src = "Images/Play.svg";

    if (!pause) {
        CurrentSong.play().then(() => {
            Play.src = "Images/Pause.svg";
        }).catch(error => {
            console.error("❌ Playback failed, user interaction needed:", error);
        });
    }

    document.querySelector(".SongDetails").innerHTML = decodeURI(Track);
    document.querySelector(".SongTime").innerHTML = "00:00 / 00:00";
}


async function displayAlbums() {
    let jsonURL = "https://insaiyanbruh.github.io/Vibify/Songs/songs.json";
    let baseURL = "https://insaiyanbruh.github.io/Vibify/Songs/";
    
    try {
        let response = await fetch(jsonURL);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        let data = await response.json();
        console.log("📀 Fetched JSON Data:", data);

        let Card_Container = document.querySelector(".Card_Container");
        Card_Container.innerHTML = ""; // Clear previous content

        for (let album in data) {
            let albumSongs = data[album];

            // Create album card
            Card_Container.innerHTML += `
                <div data-folder="${album}" class="Card">
                    <img src="${baseURL}${album}/Cover.png" alt="${album}" onerror="this.src='default-cover.png'">
                    <i class="ri-play-fill"></i>
                    <h2>${album}</h2>
                    <p>${albumSongs.length} Songs</p>
                </div>`;
        }

        console.log("✅ Albums detected:", Object.keys(data));

        // Add event listeners to album cards
        document.querySelectorAll(".Card").forEach(card => {
            card.addEventListener("click", async () => {
                let folder = card.getAttribute("data-folder");
                let Songs = data[folder].map(song => `${baseURL}${folder}/${song}`);
                PlayMusic(Songs[0]); // Play first song
            });
        });

    } catch (error) {
        console.error("❌ Error fetching albums:", error);
    }
}


    

async function main() {
    await getSongs("NCS");
    PlayMusic(Songs[0], true)

    displayAlbums()

    Play.addEventListener("click", () => {
        if (CurrentSong.paused) {
            CurrentSong.play()
            Play.src = "Images/Pause.svg"
        }
        else {
            CurrentSong.pause()
            Play.src = "Images/Play.svg"
        }
    })

    CurrentSong.addEventListener("timeupdate", () => {
        document.querySelector(".SongTime").innerHTML = `${formatTime(CurrentSong.currentTime)} / ${formatTime(CurrentSong.duration)}`
        document.querySelector(".Circle").style.left = (CurrentSong.currentTime / CurrentSong.duration) * 100 + "%";
    })

    document.querySelector(".Seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".Circle").style.left = percent + "%";
        CurrentSong.currentTime = ((CurrentSong.duration) * percent) / 100
    })

    document.querySelector(".Hamburger").addEventListener("click", () => {
        document.querySelector(".Library").style.left = "0"
    })

    document.querySelector(".Closebtn").addEventListener("click", () => {
        document.querySelector(".Library").style.left = "-100%"
    })

    window.addEventListener("resize", () => {
        if (window.innerWidth > 882) {
            document.querySelector(".Library").style.left = "0%";
        }
    });

    Previous.addEventListener("click", () => {
        CurrentSong.pause()
        let index = Songs.indexOf(CurrentSong.src.split("/").slice(-1)[0])
        if ([index - 1] >= 0) {
            PlayMusic(Songs[index - 1])
        }
    })

    Next.addEventListener("click", () => {
        CurrentSong.pause()
        let index = Songs.indexOf(CurrentSong.src.split("/").slice(-1)[0])
        if ([index + 1] < Songs.length) {
            PlayMusic(Songs[index + 1])
        }
    })

    document.querySelector(".Range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        CurrentSong.volume = parseInt(e.target.value) / 100
    })

    document.querySelector(".Vol>img").addEventListener("click", e => {
        if (e.target.src.includes("Volume.svg")) {
            e.target.src = e.target.src.replace("Volume.svg", "Mute.svg")
            CurrentSong.volume = 0;
            document.querySelector(".Range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("Mute.svg", "Volume.svg")
            CurrentSong.volume = .20;
            document.querySelector(".Range").getElementsByTagName("input")[0].value = 30;
        }
    })

}

main()
});
