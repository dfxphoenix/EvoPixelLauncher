/**
 * Script for cracked.ejs
 */
 
 // Validation Regexes.
const validUsername2         = /^[a-zA-Z0-9_]{1,16}$/

// Login Elements
const crackedCancelContainer  = document.getElementById('crackedCancelContainer')
const crackedCancelButton     = document.getElementById('crackedCancelButton')
const crackedUsernameError       = document.getElementById('crackedUsernameError')
const crackedUsername         = document.getElementById('crackedUsername')
const checkmarkContainer2    = document.getElementById('checkmarkContainer2')
const crackedRememberOption   = document.getElementById('crackedRememberOption')
const crackedButton           = document.getElementById('crackedButton')
const crackedForm             = document.getElementById('crackedForm')

// Control variables.
let lu2 = false

const loggerCracked = LoggerUtil1('%c[Login]', 'color: #000668; font-weight: bold')


/**
 * Show a login error.
 * 
 * @param {HTMLElement} element The element on which to display the error.
 * @param {string} value The error text.
 */
function showError2(element, value){
    element.innerHTML = value
    element.style.opacity = 1
}

/**
 * Shake a login error to add emphasis.
 * 
 * @param {HTMLElement} element The element to shake.
 */
function shakeError2(element){
    if(element.style.opacity == 1){
        element.classList.remove('shake')
        void element.offsetWidth
        element.classList.add('shake')
    }
}

/**
 * Validate that an username field is neither empty nor invalid.
 * 
 * @param {string} value The username value.
 */
function validateUsername(value){
    if(value){
        if(!validUsername2.test(value)){
            showError2(crackedUsernameError, Lang.queryJS('login.error.invalidValue'))
            crackedDisabled(true)
            lu2 = false
        } else {
            crackedUsernameError.style.opacity = 0
            lu2 = true
            crackedDisabled(false)
        }
    } else {
        lu2 = false
        showError2(crackedUsernameError, Lang.queryJS('login.error.requiredValue'))
        crackedDisabled(true)
    }
}

// Emphasize errors with shake when focus is lost.
crackedUsername.addEventListener('focusout', (e) => {
    validateUsername(e.target.value)
    shakeError2(crackedUsernameError)
})

// Validate input for each field.
crackedUsername.addEventListener('input', (e) => {
    validateUsername(e.target.value)
})

/**
 * Enable or disable the login button.
 * 
 * @param {boolean} v True to enable, false to disable.
 */
function crackedDisabled(v){
    if(crackedButton.disabled !== v){
        crackedButton.disabled = v
    }
}

/**
 * Enable or disable loading elements.
 * 
 * @param {boolean} v True to enable, false to disable.
 */
function crackedLoading(v){
    if(v){
        crackedButton.setAttribute('loading', v)
        crackedButton.innerHTML = crackedButton.innerHTML.replace(Lang.queryJS('login.login'), Lang.queryJS('login.loggingIn'))
    } else {
        crackedButton.removeAttribute('loading')
        crackedButton.innerHTML = crackedButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.login'))
    }
}

/**
 * Enable or disable login form.
 * 
 * @param {boolean} v True to enable, false to disable.
 */
function formDisabled2(v){
    crackedDisabled(v)
    crackedCancelButton.disabled = v
    crackedUsername.disabled = v
    if(v){
        checkmarkContainer2.setAttribute('disabled', v)
    } else {
        checkmarkContainer2.removeAttribute('disabled')
    }
    crackedRememberOption.disabled = v
}

let crackedViewOnSuccess = VIEWS.landing
let crackedViewOnCancel = VIEWS.settings
let crackedViewCancelHandler

function crackedCancelEnabled(val){
    if(val){
        $(crackedCancelContainer).show()
    } else {
        $(crackedCancelContainer).hide()
    }
}

crackedCancelButton.onclick = (e) => {
    switchView(getCurrentView(), crackedViewOnCancel, 500, 500, () => {
        crackedUsername.value = ''
        crackedCancelEnabled(false)
        if(crackedViewCancelHandler != null){
            crackedViewCancelHandler()
            crackedViewCancelHandler = null
        }
    })
}

// Disable default form behavior.
crackedForm.onsubmit = () => { return false }

// Bind login button behavior.
crackedButton.addEventListener('click', () => {
    // Disable form.
    formDisabled2(true)

    // Show loading stuff.
    crackedLoading(true)

    AuthManager.addCrackedAccount(crackedUsername.value).then((value) => {
        updateSelectedAccount(value)
        crackedButton.innerHTML = crackedButton.innerHTML.replace(Lang.queryJS('login.loggingIn'), Lang.queryJS('login.success'))
        $('.circle-loader').toggleClass('load-complete')
        $('.checkmark').toggle()
        setTimeout(() => {
            switchView(VIEWS.cracked, crackedViewOnSuccess, 500, 500, () => {
                // Temporary workaround
                if(crackedViewOnSuccess === VIEWS.settings){
                    prepareSettings()
                }
                crackedViewOnSuccess = VIEWS.landing // Reset this for good measure.
                crackedCancelEnabled(false) // Reset this for good measure.
                crackedViewCancelHandler = null // Reset this for good measure.
                crackedUsername.value = ''
                $('.circle-loader').toggleClass('load-complete')
                $('.checkmark').toggle()
                crackedLoading(false)
                crackedButton.innerHTML = crackedButton.innerHTML.replace(Lang.queryJS('login.success'), Lang.queryJS('login.login'))
                formDisabled2(false)
            })
        }, 1000)
    }).catch((displayableError) => {
        crackedLoading(false)

        let actualDisplayableError
        if(isDisplayableError(displayableError)) {
            msftLoginLogger.error('Error while logging in.', displayableError)
            actualDisplayableError = displayableError
        } else {
            // Uh oh.
            msftLoginLogger.error('Unhandled error during login.', displayableError)
            actualDisplayableError = {
                title: 'Unknown Error During Login',
                desc: 'An unknown error has occurred. Please see the console for details.'
            }
        }

        setOverlayContent(actualDisplayableError.title, actualDisplayableError.desc, Lang.queryJS('login.tryAgain'))
        setOverlayHandler(() => {
            formDisabled2(false)
            toggleOverlay(false)
        })
        toggleOverlay(true)
    })

})