const db = firebase.firestore()

const getString = function(length) {
    let result = []
    let characters = '!?@!??!!?@!?#$%@!?#ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let charactersLength = characters.length
    for (let i = 0; i < length; i++) {
        result.push(characters.charAt(Math.floor(Math.random() * charactersLength)))
    }
    return result.join('')
}

function switch_channel(channel) {
    window.localStorage.setItem("current_channel", channel)
    window.location.reload()
}

function switch_server(server) {
    window.localStorage.setItem("current_server", server)
    window.localStorage.setItem("current_channel", "Dispute Home")
    window.location.reload()
}

auth.onAuthStateChanged((user) => {
    if (user) {
        // Server Joining
        const join_server_form = document.getElementById("join_server_form")

        join_server_form.addEventListener('submit', e => {
            e.preventDefault()

            db.collection("servers").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let data = doc.data()
                    let doc_code = doc.id.split("!:DISPUTE_SERVER::GET::!?")[1]

                    if (doc_code == join_server_form.servercode.value) {
                        if (datapoint != user.uid) {
                            data.users.push(user.uid)
                            db.collection("servers").doc(doc.id).set(data).then(() => {
                                console.log("Written data.")
                            }).catch(error => {
                                console.log(error)
                            })
                        } else {
                            alert("You are already in the requested server.")
                        }
                    }
                })
            })
        })

        db.collection("servers")
            .onSnapshot((querySnapshot) => {
                document.getElementById("servers_list").innerHTML = ""
                querySnapshot.forEach((doc) => {
                    let data = doc.data()

                    let code = doc.id.split("!:DISPUTE_SERVER::GET::!?")[1]
                    if (doc.id.split("!:DISPUTE_SERVER::GET::!?")[2] == null) {
                        for (datapoint of data.users) {
                            if (datapoint == user.uid) { // is the user in the server? uid is unique, displayName isn't.
                                document.getElementById("servers_list").insertAdjacentHTML("beforeend", `
                                    <a style="background-image: url(); background: rgb(73, 96, 114); margin: 0; font-size: 1.5vh" class="server_icon" onclick="switch_server('${doc.id}')">${doc.id.split("!:DISPUTE_SERVER::GET::!?")[0]}</a>
                                `)
                            }
                        }
                    }
                })
            })

        // Server Creation

        const new_server_form = document.getElementById("new_server_form")

        new_server_form.addEventListener('submit', e => {
            e.preventDefault()

            let new_server_name = new_server_form.servername.value + "!:DISPUTE_SERVER::GET::!?" + getString(12)
            db.collection("servers").doc(new_server_name).set({
                owner: user.uid,
                channels: [],
                users: [
                    user.uid
                ]
            }).then(() => {
                console.log("Server created.")
            }).catch(error => {
                console.log(error)
            })

            db.collection("servers").doc(new_server_name).collection("general").doc("info").set({
                total_msgs: 0
            }).then(() => {
                window.localStorage.setItem("current_server", new_server_name)
                window.localStorage.setItem("current_channel", "general")
                window.location.reload()
            }).catch(erorr => {
                console.log(erorr)
            })

            db.collection("servers").doc(new_server_name).collection("general").doc("messages").set({}).then(() => {
                log("Channel creation success.", console_styles.success)
            }).catch(erorr => {
                console.log(erorr)
            })
        })

        if (document.getElementById("page").innerHTML == "servers" && window.localStorage.getItem("current_channel") && window.localStorage.getItem("current_server")) {
            document.getElementById("server_info__channel_name").innerText = "#" + window.localStorage.getItem("current_channel").split("!:DISPUTE_CHANNEL::GET::!?")[0]
            document.getElementById("server_name").innerText = window.localStorage.getItem("current_server").split("!:DISPUTE_SERVER::GET::!?")[0]
            document.getElementById("channel__name__2").innerText = window.localStorage.getItem("current_server").split("!:DISPUTE_SERVER::GET::!?")[0] + "/#" + window.localStorage.getItem("current_channel").split("!:DISPUTE_CHANNEL::GET::!?")[0]
            document.title = window.localStorage.getItem("current_server").split("!:DISPUTE_SERVER::GET::!?")[0] + " - On Dispute"

            document.getElementById("server_name").addEventListener('click', () => {
                if (confirm("Click confirm to copy server link, cancel to just copy code")) {
                    document.getElementById("copy_server_code").style.display = "block"
                    document.getElementById("copy_server_code").value = "https://dispute-app.web.app/app?" + window.localStorage.getItem("current_server").split("!:DISPUTE_SERVER::GET::!?")[1]
                    document.getElementById("copy_server_code").select()
                    document.getElementById("copy_server_code").setSelectionRange(0, 99999)
                    document.execCommand("copy")
                    document.getElementById("copy_server_code").style.display = "none"
                    alert("Copied Server Code: " + document.getElementById("copy_server_code").value)
                } else {
                    document.getElementById("copy_server_code").style.display = "block"
                    document.getElementById("copy_server_code").value = window.localStorage.getItem("current_server").split("!:DISPUTE_SERVER::GET::!?")[1]
                    document.getElementById("copy_server_code").select()
                    document.getElementById("copy_server_code").setSelectionRange(0, 99999)
                    document.execCommand("copy")
                    document.getElementById("copy_server_code").style.display = "none"
                    alert("Copied Server Code: " + document.getElementById("copy_server_code").value)
                }
            })

            db.collection("servers").doc(window.localStorage.getItem("current_server"))
                .onSnapshot((doc) => {
                    let data = doc.data()
                    document.getElementById("channels").innerHTML = ""

                    for (datapoint of data.channels) {
                        let channel_name = datapoint.split("!:DISPUTE_CHANNEL::GET::!?")[0]
                        let code = datapoint.split("!:DISPUTE_CHANNEL::GET::!?")[1]
                        let type = datapoint.split("!:DISPUTE_CHANNEL_TYPE::GET::!?")[1]

                        /* 
                           TODO:
                            Check the set channel type, create a voice tab if type == "voice"
                            Create a normal tab if type == "chat"

                           DONE:
                            Create channel type base,
                            Begin adding channel icon to channel button
                        */

                        if (!document.getElementById(channel_name + "!:DISPUTE_CHANNEL::GET::!?" + code && datapoint.split("!:DISPUTE_CHANNEL::GET::!?")[2] == null)) {
                            if (type == "Chat" || type == null) {
                                document.getElementById("channels").insertAdjacentHTML("beforeend", `
                                    <a style="display: flex;" class="channel" onclick="switch_channel('${datapoint}')" id="${channel_name + "!:DISPUTE_CHANNEL::GET::!?" + code + "!:DISPUTE_CHANNEL_TYPE::GET::!?" + type}">
                                        <i data-feather="hash" style="margin-right: 10px;"></i> ${channel_name}
                                    </a> 
                                `)
                            } else if (type == "Voice") {
                                document.getElementById("channels").insertAdjacentHTML("beforeend", `
                                    <a style="display: flex;" class="channel" onclick="switch_channel('${datapoint}')" id="${channel_name + "!:DISPUTE_CHANNEL::GET::!?" + code + "!:DISPUTE_CHANNEL_TYPE::GET::!?" + type}">
                                        <i data-feather="at-sign" style="margin-right: 10px;"></i> ${channel_name}
                                    </a> 
                                `)
                            } else if (type == "Announcements") {
                                document.getElementById("channels").insertAdjacentHTML("beforeend", `
                                    <a style="display: flex;" class="channel" onclick="switch_channel('${datapoint}')" id="${channel_name + "!:DISPUTE_CHANNEL::GET::!?" + code + "!:DISPUTE_CHANNEL_TYPE::GET::!?" + type}">
                                        <i data-feather="info" style="margin-right: 10px;"></i> ${channel_name}
                                    </a> 
                                `)
                            }

                            feather.replace()
                        }
                    }
                })

            /* if (window.localStorage.getItem("current_channel") != "Dispute Home") { // each channel has docs for each user, check if the user already has one
                db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc(user.uid).get().then((doc) => {
                    if (doc.exists) {
                        log("Currently signed in user already has a profile in this channel.", console_styles.success)
                    } else { // if not, make one
                        log("A profile has been created for the currently signed in user.", console_styles.success)
                        db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc(user.uid).set({
                            name: user.displayName,
                            can_write: false,
                            sent: []
                        })
                    }
                })
            } */

            db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).limit(6)
                .onSnapshot((querySnapshot) => { // Add real time support
                    querySnapshot.forEach((doc) => {
                        let data = doc.data()

                        if (doc.id != "info") {
                            if (data.can_write == true) {
                                document.getElementById("messagebox").style.display = "block"
                            } else {
                                document.getElementById("messagebox").style.display = "none"
                            }

                            for (datapoint of data.sent) {
                                let msg = datapoint.content
                                let code = datapoint.token
                                let int = datapoint.order
                                if (!document.getElementById(datapoint.author + ":" + code)) {
                                    // fix md
                                    msg = msg.replaceAll('"', "&quot;")

                                    msg = msg.replaceAll('# ', "")
                                    msg = msg.replaceAll('## ', "")
                                    msg = msg.replaceAll('### ', "")
                                    msg = msg.replaceAll('#### ', "")
                                    msg = msg.replaceAll('##### ', "")

                                    // TODO: delete_msg(data.uid, codes)

                                    document.getElementById("msgs").insertAdjacentHTML("beforeend", `
                    
                                        <li class="card message" style="margin-top: 5px; width: 99%; order: ${int};" id='${datapoint.author + ":" + code}'>
                                            <h5 style="display: inline; user-select: none;">${datapoint.author}</h5>
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
                        } else {
                            for (datapoint of data.rules) { // if the doc is info, check the channel info rules
                                let rule = datapoint.split(": ")
                                if (rule && rule[0] == "allow_write_from") {
                                    db.collection("servers").doc(window.localStorage.getItem("current_server")).get().then((doc) => {
                                        if (doc.exists) {
                                            if (rule[1] == "owner") {
                                                if (doc.data().owner != user.uid) {
                                                    document.getElementById("messagebox").style.display = "none"
                                                } else {
                                                    document.getElementById("messagebox").style.display = "block"
                                                }
                                            } else {
                                                document.getElementById("messagebox").style.display = "block"
                                            }
                                        }
                                    })
                                }
                            }
                        }
                    });
                }, (error) => {
                    console.log(error)
                });

            let user_msgs_allowed = true
            message_form.addEventListener('submit', e => {
                e.preventDefault()

                if (message_form.msg.value != "" && message_form.msg.value != " " && message_form.msg.value != null && message_form.msg.value && user_msgs_allowed == true) {
                    db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let data = doc.data()

                            db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc("info").get().then((_doc) => {
                                let _data = _doc.data()

                                if (doc.id == "messages") {
                                    user_msgs_allowed = false

                                    data.sent.push({ // message strucutre
                                        author: user.displayName,
                                        content: message_form.msg.value,
                                        token: getString(12),
                                        order: _data.total_msgs
                                    })

                                    db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc("messages").set(data).then(() => {
                                        log("Written data to channel messages.", console_styles.success)
                                    }).catch((error) => {
                                        console.log(error)
                                    })

                                    setTimeout(() => {
                                        user_msgs_allowed = true
                                    }, 1000);
                                }

                                setTimeout(() => {
                                    _data.total_msgs = _data.total_msgs + 1
                                    db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc("info").set(_data)
                                }, 100);
                            })
                        });
                    });

                    setTimeout(() => {
                        message_form.reset()
                    }, 500);
                }
            })

            document.getElementById("newchannel").addEventListener('click', () => {
                if (document.getElementById("newchannel__form").style.display == "block") {
                    document.getElementById("newchannel__form").style.display = "none"
                } else {
                    document.getElementById("newchannel__form").style.display = "block"
                }
            })

            document.getElementById("newchannel__form_set").addEventListener('submit', e => {
                e.preventDefault()

                let type = "!:DISPUTE_CHANNEL_TYPE::GET::!?" + document.getElementById("newchannel__form_set").type.value
                let channelname = document.getElementById("newchannel__form_set").channel.value + "!:DISPUTE_CHANNEL::GET::!?" + getString(10) + type

                let locked

                if (document.getElementById("newchannel__form_set").type.value == "Announcements") {
                    locked = "owner"
                } else if (document.getElementById("newchannel__form_set").type.value == "Chat") {
                    locked = "all"
                }

                db.collection(`servers/${window.localStorage.getItem("current_server")}/${channelname}`).doc("info").set({
                    total_msgs: 0,
                    rules: [
                        "allow_write_from: " + locked
                    ]
                })

                db.doc(`servers/${window.localStorage.getItem("current_server")}`).get().then((doc) => {
                    let data = doc.data()
                    data.channels.push(channelname)
                    db.collection("servers").doc(window.localStorage.getItem("current_server")).set(data)
                })
            })

            db.collection("servers").doc(window.localStorage.getItem("current_server")).get().then((doc) => { // basic permissions
                let data = doc.data()
                if (user.uid == data.owner) {
                    document.getElementById("newchannel").style.display = "block"
                    log("The currently signed in user is the owner of the current server they are in.", console_styles.success)
                } else {
                    document.getElementById("newchannel").style.display = "none"
                    log("The currently signed in user is not the owner of the current server they are in.", console_styles.warning)
                }
            })

            log("STOP!\n\nDon't paste anything into the console unless you know what you are doing.", console_styles.warning)
            log("If you know exactly what you are doing, come contribute to Dispute on github! https://github.com/0aoq/Dispute")
            console.log("==========================================")
        }
    }
});
