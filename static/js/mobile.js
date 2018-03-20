/* Localization */
const language = document.documentElement.lang === '' ? 'en' : document.documentElement.lang
var i18nDictionary = {}
var languageLookups = 0
var languageLookupThreshold = 3

$('#label_title').text(i18n('RocketMap - Nearby Pokémon'))
$('#label_nearby_pokemon').text(i18n('Nearby Pokémon'))
$('#label_button_refresh').text(i18n('Refresh'))
$('#label_use_device_location').text(i18n('Use device location'))

var useLoc = document.getElementById('use-loc')
useLoc.checked = localStorage.useLoc === 'true'
useLoc.onchange = function () {
    localStorage.useLoc = useLoc.checked
}

var navBtn = document.querySelector('#nav button')
navBtn.onclick = function () {
    if (localStorage.useLoc !== 'true') {
        navBtn.disabled = true
        return (location.href = 'mobile')
    } else if ('geolocation' in navigator) {
        // Getting the GPS position can be very slow on some devices
        navBtn.disabled = true
        navBtn.innerText = 'Locating...'

        // Get location and use it!
        navigator.geolocation.getCurrentPosition(function (p) {
            navBtn.innerText = 'Reloading...'
            location.href = 'mobile?lat=' + p.coords.latitude + '&lon=' + p.coords.longitude
        }, function (err) {
            navBtn.innerText = 'Reload'
            navBtn.disabled = false
            alert('Failed to get location: ' + err.message)
        }, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 5000
        })
    } else {
        alert(i18n('Your device does not support web geolocation'))
    }
}

function updateTimes() {
    // server tells us how many seconds are left we note the
    // pageload time and count down from there.
    // Yes, this could be a smidge innaccurate, but not by
    // more than 1 second or so which doesn't matter.
    // And now we don't have to deal with timestamps and dates!
    var remains = document.querySelectorAll('span.remain')
    for (var i = 0; i < remains.length; ++i) {
        var element = remains[i]
        var now = new Date().getTime()
        var secondsPassed = Math.floor((now - pageLoaded) / 1000)
        var alivefor = element.getAttribute('disappear')
        var remain = alivefor - secondsPassed
        var min = Math.floor(remain / 60)
        var sec = remain % 60
        element.innerText = (remain > 0) ? min + ' min ' + sec + ' sec' : '(expired)'
    }
}
setInterval(updateTimes, 1000)

document.querySelectorAll('li').forEach(function (listItem) {
    listItem.onclick = function () {
        window.document.location = this.getAttribute('href')
    }
})

function i18n(word) {
    if ($.isEmptyObject(i18nDictionary) && language !== 'en' && languageLookups < languageLookupThreshold) {
        $.ajax({
            url: 'static/dist/locales/' + language + '.min.json',
            dataType: 'json',
            async: false,
            success: function (data) {
                i18nDictionary = data
            },
            error: function (jqXHR, status, error) {
                console.log('Error loading i18n dictionary: ' + error)
                languageLookups++
            }
        })
    }
    if (word in i18nDictionary) {
        return i18nDictionary[word]
    } else {
        // Word doesn't exist in dictionary return it as is
        return word
    }
}
