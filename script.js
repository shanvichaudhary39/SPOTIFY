const audio = document.getElementById('myAudio');
const songItems = Array.from(document.querySelectorAll('.songItem'));
const progress = document.getElementById('myprogress');
const masterPlay = document.getElementById('playBtn');
const forwardBtn = document.getElementById('forward');
const backwardBtn = document.getElementById('backward');
const currentTimeEl = document.getElementById('currentTime');
const durationTimeEl = document.getElementById('durationTime');

let currentIndex = -1;

function clearAllIcons() {
	songItems.forEach(it => {
		it.classList.remove('playing');
		const icon = it.querySelector('.songPlayIcon');
		if (icon) {
			icon.classList.remove('fa-pause');
			icon.classList.add('fa-play');
		}
	});
}

function updateMasterPlay(isPlaying) {
	if (!masterPlay) return;
	if (isPlaying) {
		masterPlay.classList.remove('fa-play');
		masterPlay.classList.add('fa-pause');
	} else {
		masterPlay.classList.remove('fa-pause');
		masterPlay.classList.add('fa-play');
	}
}

function updateActive(index) {
	if (index < 0 || index >= songItems.length) {
		clearAllIcons();
		return;
	}
	songItems.forEach((it, i) => {
		const icon = it.querySelector('.songPlayIcon');
		if (i === index) {
			it.classList.add('playing');
			if (icon) {
				icon.classList.remove('fa-play');
				icon.classList.add('fa-pause');
			}
		} else {
			it.classList.remove('playing');
			if (icon) {
				icon.classList.remove('fa-pause');
				icon.classList.add('fa-play');
			}
		}
	});
	currentIndex = index;
}

function setPausedIcon(index) {
	if (index < 0 || index >= songItems.length) return;
	const it = songItems[index];
	const icon = it.querySelector('.songPlayIcon');
	if (icon) {
		icon.classList.remove('fa-pause');
		icon.classList.add('fa-play');
	}
	it.classList.remove('playing');
}

function playSong(index) {
	const item = songItems[index];
	if (!item) return;
	const file = item.dataset.file;
	if (!file) return;
	// encode filename so spaces/special chars work in src
	audio.src = encodeURI(file);
	audio.play().catch(() => {});
	updateActive(index);
	updateMasterPlay(true);
}

songItems.forEach((item, index) => {
	item.addEventListener('click', (e) => {
		// toggle play/pause if clicking currently playing song
		if (currentIndex === index && !audio.paused && audio.src && audio.src.includes(item.dataset.file)) {
			audio.pause();
			updateMasterPlay(false);
			// show paused icon but keep currentIndex so resume picks up same song
			setPausedIcon(currentIndex);
		} else {
			playSong(index);
		}
	});
});

// allow clicking the small icon to toggle without triggering parent twice
songItems.forEach((item, index) => {
	const icon = item.querySelector('.songPlayIcon');
	if (!icon) return;
	icon.addEventListener('click', (e) => {
		e.stopPropagation();
		if (currentIndex === index && !audio.paused && audio.src && audio.src.includes(item.dataset.file)) {
			audio.pause();
			updateMasterPlay(false);
			setPausedIcon(currentIndex);
		} else {
			playSong(index);
		}
	});
});

if (masterPlay) {
	masterPlay.addEventListener('click', () => {
		if (audio.src && !audio.paused) {
			audio.pause();
			// keep currentIndex so resume returns to same song
			updateMasterPlay(false);
				setPausedIcon(currentIndex);
		} else if (audio.src) {
			audio.play().catch(() => {});
			updateMasterPlay(true);
			if (currentIndex >= 0) updateActive(currentIndex);
		} else {
			playSong(0);
		}
	});
}

if (forwardBtn) {
	forwardBtn.addEventListener('click', () => {
		const next = (currentIndex + 1) % songItems.length;
		playSong(next);
	});
}

if (backwardBtn) {
	backwardBtn.addEventListener('click', () => {
		const prev = (currentIndex - 1 + songItems.length) % songItems.length;
		playSong(prev);
	});
}

if (audio) {
	function formatTime(t) {
		if (!t || isNaN(t)) return '0:00';
		const minutes = Math.floor(t / 60);
		const seconds = Math.floor(t % 60).toString().padStart(2, '0');
		return `${minutes}:${seconds}`;
	}

	audio.addEventListener('loadedmetadata', () => {
		durationTimeEl.textContent = formatTime(audio.duration);
		progress.value = 0;
	});

	audio.addEventListener('timeupdate', () => {
		if (audio.duration) {
			progress.value = Math.floor((audio.currentTime / audio.duration) * 100);
			currentTimeEl.textContent = formatTime(audio.currentTime);
			// keep duration updated in case metadata arrives late
			durationTimeEl.textContent = formatTime(audio.duration);
		}
	});

	audio.addEventListener('play', () => {
		updateMasterPlay(true);
		if (currentIndex >= 0) updateActive(currentIndex);
	});

	audio.addEventListener('pause', () => {
		updateMasterPlay(false);
		// keep active item shown but with pause icon cleared by updateActive(-1)
	});

	audio.addEventListener('ended', () => {
		const next = (currentIndex + 1) % songItems.length;
		playSong(next);
	});
}

if (progress) {
	progress.addEventListener('input', (e) => {
		if (!audio.duration) return;
		audio.currentTime = (e.target.value / 100) * audio.duration;
	});
}

