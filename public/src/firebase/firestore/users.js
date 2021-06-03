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
                                document.querySelector(".container-2").innerHTML = `
                                    <div class="container-xl flex flex-just-center mar-lr-auto">
                                        <div class="card box-shadow onhover wd-full mb-25px" style="background: white !important;">
                                            <h1 class="heading" style="margin: 0;">${data.name}</h1>
                                            <p class="text" style="margin: 0;">ID: ${data.userId}</p>

                                            <br>
                                            <p class="text small">${marked(data.about)}</p>

                                            <br>
                                            <br>
                                            <div class="flex" style="gap: 1rem;" id="profile_badges"></div>
                                        </div>
                                    </div>
                                `

                                for (badge of data.badges) {
                                    document.querySelector("#profile_badges").innerHTML += `
                                        <div class="card onhover translate shadow maxcontent">
                                            <h2 class="text-small">${badge}</h2>
                                        </div>
                                    `
                                }

                                document.title = data.name + " - Dispute"
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
