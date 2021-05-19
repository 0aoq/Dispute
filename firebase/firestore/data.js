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
    window.localStorage.setItem("current_channel", "general")
    window.location.reload()
}

auth.onAuthStateChanged((user) => {
    if (user) {
        db.collection("servers").doc(window.localStorage.getItem("current_server"))
            .onSnapshot((doc) => {
                let data = doc.data()

                for (datapoint of data.channels) {
                    let channel_name = datapoint.split("!:DISPUTE_CHANNEL::GET::!?")[0]
                    let code = datapoint.split("!:DISPUTE_CHANNEL::GET::!?")[1]

                    if (!document.getElementById(channel_name + "!:DISPUTE_CHANNEL::GET::!?" + code && datapoint.split("!:DISPUTE_CHANNEL::GET::!?")[2] == null)) {
                        document.getElementById("channels").insertAdjacentHTML("beforeend", `
                            <a style="display: flex;" onclick="switch_channel('${datapoint}')" id="${code}">#${channel_name}</a> 
                        `)
                    }
                }
            })

        db.collection("servers")
            .onSnapshot((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let data = doc.data()

                    let code = doc.id.split("!:DISPUTE_SERVER::GET::!?")[1]
                    if (!document.getElementById(doc.id + "!:DISPUTE_SERVER::GET::!?" + code && doc.id.split("!:DISPUTE_SERVER::GET::!?")[2] == null)) {
                        document.getElementById("sidebar").insertAdjacentHTML("beforeend", `
                            <a style="background-image: url(); background: rgb(83, 108, 129); margin: 0;" class="server_icon" onclick="switch_server('${doc.id}')">#</a>
                        `)
                    }
                })
            })

        db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
            } else {
                db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).set({
                    name: user.displayName,
                    server_verified: false,
                    sent: []
                })
            }
        })

        if (document.getElementById("page").innerHTML == "servers" && window.localStorage.getItem("current_channel") && window.localStorage.getItem("current_server")) {
            document.getElementById("server_info__channel_name").innerText = "#" + window.localStorage.getItem("current_channel");
            document.getElementById("server_name").innerText = window.localStorage.getItem("current_server");
            db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`)
                .onSnapshot((querySnapshot) => { // Add real time support
                    querySnapshot.forEach((doc) => {
                        let data = doc.data()

                        if (doc.id != "info") {
                            for (datapoint of data.sent) {
                                let msg = datapoint.split("!DISPUTE_STORE/dispute_token:yXA?U::/")[0]
                                let code = datapoint.split("!DISPUTE_STORE/dispute_token:yXA?U::/")[1]
                                let int = datapoint.split("!DISPUTE_STORE/dispute_token:dwA?U::/")[1]
                                if (!document.getElementById(data.name + ":" + datapoint + ":" + code) && datapoint.split("!DISPUTE_STORE/dispute_token:yXA?U::/")[2] == null) {
                                    document.getElementById("msgs").insertAdjacentHTML("beforeend", `
                    
                                        <li class="card message" style="margin-top: 5px; width: 99%; order: ${int};" id="${data.name + ":" + datapoint + ":" + code}">
                                            <h5 style="display: inline; user-select: none;">${data.name}</h5>
                                            <span style="margin-left: 20px;">${msg}</span>
                                        </li>
                                
                                    `)
                                }
                            }
                        }
                    });
                }, (error) => {
                    console.log(error)
                });

            message_form.addEventListener('submit', e => {
                e.preventDefault()

                if (message_form.msg.value != "" && message_form.msg.value != " " && message_form.msg.value != null && message_form.msg.value) {
                    db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let data = doc.data()

                            db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc("info").get().then((doc) => {
                                let _data = doc.data()

                                if (data.name == user.displayName) {
                                    data.server_verified = true
                                    data.sent.push(message_form.msg.value + "!DISPUTE_STORE/dispute_token:yXA?U::/" + getString(8) + "!DISPUTE_STORE/dispute_token:dwA?U::/" + _data.total_msgs)

                                    db.collection(`servers/${window.localStorage.getItem("current_server")}/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).set(data).then(() => {
                                        console.log("Written data.")
                                    }).catch((error) => {
                                        console.log(error)
                                    })
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

                let channelname = document.getElementById("newchannel__form_set").channel.value + "!:DISPUTE_CHANNEL::GET::!?" + getString(10)
                db.collection(`servers/${window.localStorage.getItem("current_server")}/${channelname}`).doc("info").set({
                    total_msgs: 0
                })

                db.doc(`servers/${window.localStorage.getItem("current_server")}`).get().then((doc) => {
                    let data = doc.data()
                    data.channels.push(channelname)
                    db.collection("servers").doc(window.localStorage.getItem("current_server")).set(data)
                })
            })

            // Server Creation

            const new_server_form = document.getElementById("new_server_form")

            new_server_form.addEventListener('submit', e => {
                e.preventDefault()

                let new_server_name = new_server_form.servername.value + "!:DISPUTE_SERVER::GET::!?" + getString(12)
                db.collection("servers").doc(new_server_name).set({
                    channels: [
                        "general"
                    ]
                })

                db.collection("servers").doc(new_server_name).collection("general").doc("info").set({
                    total_msgs: 0
                })
            })
        } else {
            window.localStorage.setItem("current_channel", "general")
            window.localStorage.setItem("current_server", "dev")
            window.reload()
        }
    }
});
