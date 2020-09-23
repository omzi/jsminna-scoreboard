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
const getLeaderboard = () => {
  fetch(`/results.json`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data)

      if (data.errorMessage === undefined) {
        setCookie('JSMinnaLeaderboard', JSON.stringify(data), 30)
        renderInterns(data);
      } else if (getCookie("JSMinnaLeaderboard") !== null) {
        Notify({
          title: 'Unable to load current chart scores. Loading stale data...',
          type: 'warning', position: 'bottom center', duration: 3500
        })
        // Load stale results
        const data = JSON.parse(getCookie('JSMinnaLeaderboard')); renderInterns(data);
      } else {
        cuteAlert({
          type: 'error', title: 'A fatal error occured :(',
          message: 'Unable to retrieve both current & cached chart scores. Refresh the page to see if it fixes it',
          buttonText: 'Reload'
        }).then(() => {
          location.reload()
        })
      }
    })
    .catch((e) => {
      console.error('Error :>>', e)
      // POST error to log, maybe
    })
}

document.addEventListener('change', filterByTrack);
document.addEventListener('DOMContentLoaded', getLeaderboard)