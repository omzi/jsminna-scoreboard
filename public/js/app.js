const JSMINNA_LEADERBOARD_URL = 'https://jsmx-leaderboard.herokuapp.com/leaderboard/results.json';
const loader = document.querySelector('.loader');
const scoresList = document.querySelector('.scores-list');
const topThreeRow = document.querySelector('.top-three .row');
const trackChangeRadios = document.querySelectorAll('input[type=radio]');
let allInternsTimeout = [];
HTMLElement.prototype.empty = function() {
  const element = this;
  while (element.hasChildNodes()) {
      element.removeChild(element.lastChild);
  }
}

const generateInternMarkup = (internDetails, position) => {
  const { nickname, track, score } = internDetails;
  const trimmedNickname = nickname.trim().split(' ').join('');

  return position <= 3
    ? `<div class="col s4 center ${position == 1 ? 'first pulse fadeInUp infinite offset-s4' : position == 2 ? 'second bounceInLeft' : 'third bounceInRight'} animated">
        <div class="position">${position}</div>
        ${position == 1 ? '<img src="img/gold-crown.png" class="crown" oncontextmenu="return !!0">' : ''}
        <img src="https://robohash.org/${trimmedNickname}${track}" alt="${nickname}" oncontextmenu="return !!0">
        <div class="name">${nickname}</div>
        <div class="score">${score}</div>
      </div>`
    : `<div class="item ${track} fadeInUp animated">
        <div class="position">${position}</div>
        <div class="pic" style="background-image: url(https://robohash.org/${trimmedNickname}${track})"></div>
        <div class="name">${nickname}</div>
        <div class="score">${score}</div>
      </div>`
}

const renderInterns = interns => {
  let topThreeArray = []; loader.style.opacity = 0;
  setTimeout(() => trackChangeRadios.forEach(radio => radio.removeAttribute('disabled')), 4e3)

  setTimeout(() => {
    interns.forEach((intern, position) => {
      position < 3 && topThreeArray.push(generateInternMarkup(intern, position + 1))
      position === 3 && topThreeArray.forEach((boss, position) => {
        let internTimeout = setTimeout(() => {
          position === 1 && document.querySelector('.first').classList.remove('offset-s4', 'fadeInUp')
          position = position === 1 ? 'afterbegin' : 'beforeend', topThreeRow.insertAdjacentHTML(position, boss)
        }, position * 1e3)
        allInternsTimeout.push(internTimeout)
      })
      position >= 3 && setTimeout(() => {
        let internTimeout = setTimeout(() => {
          scoresList.insertAdjacentHTML('beforeend', generateInternMarkup(intern, position + 1))
        }, position * 500)
        allInternsTimeout.push(internTimeout)
      }, 2e3)
    })
  }, 500)
}

const setCookie = (name, value, days) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

const getCookie = name => {
  let pair = document.cookie.match(new RegExp(name + '=([^;]+)'))
  return pair ? (pair.shift(), pair.shift()) : null
}

const deleteCookie = name => setCookie(name, '', -1)

// Filtering by track
const filterByTrack = (e) => {
  let interns = JSON.parse(getCookie('JSMinnaLeaderboard'));

  if (interns) {
    allInternsTimeout.forEach(timeout => clearTimeout(timeout))
    trackChangeRadios.forEach(radio => radio.setAttribute('disabled', true))
    setTimeout(() => trackChangeRadios.forEach(radio => radio.removeAttribute('disabled')), 4e3)

    switch (e.target.value) {
      case 'all':
        topThreeRow.empty(), scoresList.empty(), renderInterns(interns);
        break;
      case 'backend':
        topThreeRow.empty(), scoresList.empty();
        renderInterns(interns.filter(intern => intern.track === 'backend'));
        break;
      case 'frontend':
        topThreeRow.empty(), scoresList.empty();
        renderInterns(interns.filter(intern => intern.track === 'frontend'));
        break;
    }
  } else {
    cuteAlert({
      type: 'error',
      title: 'A fatal error occured :(',
      message: 'Unable to retrieve cached chart scores. The page needs to be reloaded to fix this',
      buttonText: 'Reload'
    }).then(() => {
      location.reload()
    })
  }
}

// Fetch leaderboard details
// TODO: Deploy my own cors-anywhere instnce to avoid rate limiting
const getLeaderboard = () => {
  fetch(`https://cors-anywhere.herokuapp.com/${JSMINNA_LEADERBOARD_URL}`)
    .then((res) => res.json())
    .then((data) => {
      setCookie('JSMinnaLeaderboard', JSON.stringify(data), 30)
      renderInterns(data);
    })
    .catch((e) => {
      console.error('Error :>>', e)
      if (getCookie("JSMinnaLeaderboard") !== null) {
        const data = JSON.parse(getCookie('JSMinnaLeaderboard')); renderInterns(data);
        setCookie('JSMinnaLeaderboard', JSON.stringify(data), 30);
      } else {
        // Load stale results (uh, maybe)
        cuteAlert({
          type: 'question',
          title: 'An error occured :(',
          message: 'Unable to load current chart scores. Proceed to load stale data?',
          confirmText: 'Alrighty🙂',
          cancelText: 'Hell no🤨!'
        }).then(e => {
          // e == 'confirm' ? console.log('Alrighty') : console.log('Hell no!')
          if (e === 'confirm') {
            fetch('js/results.json')
              .then((res) => res.json())
              .then((data) => renderInterns(data))
              .catch((e) => console.error('Error :>>', e))
          } else {
            // Gooodbye, I guess
            trackChangeRadios.forEach(radio => radio.setAttribute('disabled', true))
            loader.style.opacity = 0, location.reload();
          }
        })
      }
    })
}

document.addEventListener('change', filterByTrack);
document.addEventListener('DOMContentLoaded', getLeaderboard)