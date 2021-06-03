function switch_dm(dm) {
    window.localStorage.setItem("current_dm", dm)
    window.location.reload()
}

function delete_dm(dm) {
    db.collection("directMessages").doc(dm).delete().then(() => {
        log("Deleted direct message.", console_styles.success)
    }).catch((error) => {
        log(error, console_styles.warning)
    })
}

auth.onAuthStateChanged((user) => {
    if (user) {
        if (!window.localStorage.getItem("current_dm") != "") {
            log("Failed to load direct messages - User is viewing a server.", console_styles.warning)
        } else {
            if (window.localStorage.getItem("current_dm").split(", ")[2] == user.displayName) {
                document.getElementById("server_info__channel_name").innerText = window.localStorage.getItem("current_dm").split(", ")[3]
                document.getElementById("server_name").innerText = "Direct Messages"
                document.getElementById("channel__name__2").innerText = window.localStorage.getItem("current_dm").split(", ")[3]
                document.title = window.localStorage.getItem("current_dm").split(", ")[3] + " - On Dispute"

                document.getElementById("messagebox").style.display = "block"
            } else if (window.localStorage.getItem("current_dm").split(", ")[2] != "Home") {
                document.getElementById("server_info__channel_name").innerText = window.localStorage.getItem("current_dm").split(", ")[2]
                document.getElementById("server_name").innerText = "Direct Messages"
                document.getElementById("channel__name__2").innerText = window.localStorage.getItem("current_dm").split(", ")[2]
                document.title = window.localStorage.getItem("current_dm").split(", ")[2] + " - On Dispute"

                document.getElementById("messagebox").style.display = "block"
            } else {
                document.title = "Viewing direct messages - On Dispute"
            }

            // Load join modal button
            document.getElementById("channels").insertAdjacentHTML("beforeend", `
                <a style="display: flex;" class="channel" onclick="open_modal('dm_modal')">
                    <i data-feather="plus-square" style="margin-right: 10px;"></i> New DM
                </a> 
            `)

            feather.replace()

            db.collection("users").doc(user.uid).get().then((doc) => {
                let data = doc.data()
                db.collection("directMessages")
                    .onSnapshot((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            document.getElementById("channels").innerHTML = ""
                            document.getElementById("channels").insertAdjacentHTML("beforeend", `
                            <a style="display: flex;" class="channel" onclick="open_modal('dm_modal')">
                                <i data-feather="plus-square" style="margin-right: 10px;"></i> New DM
                            </a> 
                        `)

                            let dm_user_1 = doc.id.split(", ")[0]
                            let dm_user_2 = doc.id.split(", ")[1]

                            let dm_userName_1 = doc.id.split(", ")[2]
                            let dm_userName_2 = doc.id.split(", ")[3]

                            if (data.userId == dm_user_1) {
                                document.getElementById("channels").insertAdjacentHTML("beforeend", `
                                <a style="display: flex;" class="channel dm" onclick="switch_dm('${doc.id}')">
                                    <i data-feather="user" style="margin-right: 10px;"></i> ${dm_userName_2}
                                    <datalist>${doc.id}</datalist>
                                </a> 
                            `)
                            } else if (data.userId == dm_user_2) {
                                document.getElementById("channels").insertAdjacentHTML("beforeend", `
                                <a style="display: flex;" class="channel dm" onclick="switch_dm('${doc.id}')">
                                    <i data-feather="user" style="margin-right: 10px;"></i> ${dm_userName_1}
                                    <datalist>${doc.id}</datalist>
                                </a> 
                            `)
                            }

                            feather.replace()
                        })
                    })
            })


            db.collection("directMessages").doc(window.localStorage.getItem("current_dm"))
                .onSnapshot((doc) => {
                    let data = doc.data()

                    for (datapoint of data.sent) {
                        let msg = datapoint.content
                        let code = datapoint.token
                        let int = datapoint.order
                        if (!document.getElementById(datapoint.author + ":" + code)) {
                            // fix md
                            msg = msg.replaceAll('"', "&quot;") // replace quotes because they used to break stuff

                            msg = msg.replaceAll('# ', "")
                            msg = msg.replaceAll('## ', "")
                            msg = msg.replaceAll('### ', "")
                            msg = msg.replaceAll('#### ', "")
                            msg = msg.replaceAll('##### ', "")

                            // TODO: delete_msg(data.uid, codes)

                            document.getElementById("msgs").insertAdjacentHTML("beforeend", `
        
                                <li class="card message" style="margin-top: 5px; width: 99%; order: ${int};" id='${datapoint.author + ":" + code}'>
                                    <h5 style="display: inline; user-select: none;"><a href="profile.html?${datapoint.author.split("#")[1]}">${datapoint.author.split("#")[0]}</a></h5>
                                    <span style="margin-left: 20px;">${marked(msg)}</span>
                                </li>
                        
                            `)

                            let links = document.querySelectorAll("#msgs li a")
                            for (var i = 0, len = links.length; i < len; i++) {
                                if (!links[i].classList.contains("btn")) {
                                    links[i].classList.add("btn")
                                }
                            }

                            let p = document.querySelectorAll("#msgs li p")
                            for (var i = 0, len = p.length; i < len; i++) {
                                p[i].style.display = "inline"
                            }

                            $("#msgs").animate({ scrollTop: $('#msgs').prop("scrollHeight") }, 1000);
                        }
                    }
                })

            document.getElementById("dm_form").addEventListener('submit', e => {
                e.preventDefault()

                db.collection("users").doc(user.uid).get().then((doc) => {
                    let data = doc.data()

                    db.collection("users")
                        .onSnapshot((querySnapshot) => {
                            querySnapshot.forEach((userProfile) => {
                                let userData = userProfile.data()
                                if (userData.userId == document.getElementById("dm_form").userid.value && userProfile.id != user.uid && userData.userId != data.userId) { // check for the user id
                                    db.collection("directMessages").doc(`${userData.userId}, ${data.userId}, ${userData.name}, ${user.displayName}`).set({
                                        profiles: [
                                            userProfile.id,
                                            user.uid
                                        ],
                                        sent: [],
                                        total_msgs: 0
                                    }).then(() => {
                                        log("Created DM.", console_styles.success)
                                    }).catch(error => {
                                        log(error, console_styles.warning)
                                    })
                                }
                            })
                        })
                })
            })

            let user_msgs_allowed = true
            message_form.addEventListener('submit', e => {
                e.preventDefault()

                if (message_form.msg.value != "" && message_form.msg.value != " " && message_form.msg.value != null && message_form.msg.value && user_msgs_allowed == true) {
                    db.collection("users").doc(user.uid).get().then((userdoc) => {
                        db.collection("directMessages").doc(window.localStorage.getItem("current_dm")).get().then((doc) => {
                            let data = doc.data()

                            user_msgs_allowed = false

                            let userdata = userdoc.data()
                            data.sent.push({ // message strucutre
                                author: user.displayName + "#" + userdata.userId,
                                content: message_form.msg.value,
                                token: getString(12),
                                order: data.total_msgs
                            })

                            db.collection("directMessages").doc(window.localStorage.getItem("current_dm")).set(data).then(() => {
                                log("Written message to DM.", console_styles.success)
                            }).catch((error) => {
                                console.log(error)
                            })

                            setTimeout(() => {
                                user_msgs_allowed = true
                            }, 1000);
                        });
                    })

                    setTimeout(() => {
                        message_form.reset()
                    }, 500);
                }
            })
        }
    }
});
