/*
    User profile data
    Dispute app beta.
*/

auth.onAuthStateChanged((user) => {
    if (user) {
        if (document.getElementById("page").innerHTML == "profile") {
            let id = window.location.search.slice(1)

            if (id) {
                db.collection("users").get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if (doc.id != "info") {
                            let data = doc.data()

                            if (data.userId == id) {
                                document.querySelector(".card").classList.add("wd-full") // Make box expand to full, looks bad on just the button version
                                document.querySelector(".card").innerHTML = `
                                <h1 class="heading">${data.name}</h1>
                                <h2 class="text">ID: ${data.userId}</h2>
                                <br>
                                <p class="text small"><b>About Me:</b></p>
                                <p class="text small">${marked(data.about)}</p>
                            `
                            }
                        }
                    })
                })
            }
        } else if (document.getElementById("page").innerHTML == "servers") {
            let bioform = document.getElementById("change_bio_form")
            bioform.addEventListener('submit', e => {
                e.preventDefault()

                db.collection("users").get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if (doc.id != "info") {
                            let data = doc.data()

                            if (doc.id == user.uid) {
                                data.about = bioform.about.value
                                db.collection("users").doc(user.uid).set(data).then(() => {
                                    log("Written profile data.", console_styles.success)
                                }).catch(err => {
                                    log(err, console_styles.warning)
                                })
                            }
                        }
                    })
                })

                setTimeout(() => {
                    bioform.reset()
                }, 500);
            })

            let nameform = document.getElementById("change_name_form")
            nameform.addEventListener('submit', e => {
                e.preventDefault()

                db.collection("users").get().then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        if (doc.id != "info") {
                            let data = doc.data()

                            if (doc.id == user.uid) {
                                data.name = nameform.name.value
                                db.collection("users").doc(user.uid).set(data).then(() => {
                                    log("Written profile data.", console_styles.success)
                                }).catch(err => {
                                    log(err, console_styles.warning)
                                })
                            }
                        }
                    })
                })

                user.updateProfile({
                    displayName: nameform.name.value
                })

                setTimeout(() => {
                    nameform.reset()
                }, 500);
            })
        }
    }
});
