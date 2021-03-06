const auth = firebase.auth()

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
        console.log("Auth setPersistence")
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode, errorMessage)
    });

if (document.getElementById("page").innerHTML == "auth") {
    document.getElementById("signupform").addEventListener('submit', e => {
        e.preventDefault()

        const email = document.getElementById("signupform").email.value
        const password = document.getElementById("signupform").password.value
        const username = document.getElementById("signupform").username.value
        const about = document.getElementById("signupform").about.value

        auth.createUserWithEmailAndPassword(email, password).then(function(result) {
                window.localStorage.setItem("user__profileInfo_localSave:about", about)
                return result.user.updateProfile({
                    displayName: username
                })
            })
            .catch(function(error) {
                var errorCode = error.code;
                var errorMessage = error.message;
                if (errorCode == 'auth/weak-password') {
                    alert('The password is too weak.');
                } else {
                    alert(errorMessage);
                }
                console.log(error);
                alert(error)
            });
    })

    document.getElementById("loginform").addEventListener('submit', e => {
        e.preventDefault()

        const email = document.getElementById("loginform").email.value
        const password = document.getElementById("loginform").password.value

        auth.signInWithEmailAndPassword(email, password)
    })
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User is signed in.")

        if (document.getElementById("page").innerHTML == "auth") {
            setTimeout(() => {
                if (window.location.search.slice(1)) {
                    window.location = window.location.search.slice(1)
                } else {
                    window.location = "app.html"
                }
            }, 100);
        } else if (document.getElementById("page").innerHTML == "servers") {
            document.querySelector("#user_info h4").innerText = user.displayName
            document.querySelector("#user_info a").addEventListener('click', () => {
                auth.signOut()
            })

            document.getElementById("change_email_form").addEventListener('submit', e => {
                e.preventDefault()
                user.updateEmail(document.getElementById("change_email_form").email.value)
                document.getElementById("change_email_form").reset()
            })
        }
    } else {
        console.log("User is not signed in.")

        if (document.getElementById("auth_required").innerHTML == "true") {
            window.location = "auth.html?" + window.location.href
        }
    }
});
