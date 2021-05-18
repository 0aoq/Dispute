var auth = firebase.auth()

if (document.getElementById("page").innerHTML == "auth") {
    document.getElementById("signupform").addEventListener('submit', e => {
        e.preventDefault()

        const email = document.getElementById("signupform").email.value
        const password = document.getElementById("signupform").password.value
        const username = document.getElementById("signupform").username.value

        auth.createUserWithEmailAndPassword(email, password).then(function(result) {
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

        user.providerData.forEach(function(profile) {
            console.log("Sign-in provider: " + profile.providerId);
            console.log("  Provider-specific UID: " + profile.uid);
            console.log("  Name: " + profile.displayName);
            console.log("  Email: " + profile.email);
            console.log("  Photo URL: " + profile.photoURL);
        });

        if (document.getElementById("page").innerHTML == "auth") {
            setTimeout(() => {
                window.location = "servers.html"
            }, 100);
        }
    } else {
        console.log("User is not signed in.")

        if (document.getElementById("auth_required").innerHTML == "true") {
            window.location = "index.html"
        }
    }
});