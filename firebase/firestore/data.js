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

auth.onAuthStateChanged((user) => {
    if (user) {
        db.doc("servers/dev").get().then((doc) => {
            let data = doc.data()

            for (datapoint of data.channels) {
                document.getElementById("channels").insertAdjacentHTML("beforeend", `
                    <a style="display: flex;" onclick="switch_channel('${datapoint}')">#${datapoint}</a> 
                `)
            }
        })

        db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
            } else {
                db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).set({
                    name: user.displayName,
                    server_verified: false,
                    sent: []
                })
            }
        })

        if (document.getElementById("page").innerHTML == "servers" && window.localStorage.getItem("current_channel")) {
            document.getElementById("server_info__channel_name").innerText = "#" + window.localStorage.getItem("current_channel");
            /* db.collection("servers/dev/general").get().then((querySnapshot) => { // DO NOT USE : NOT REALTIME : DOESN'T SUPPORT MULTIPLE CHANNELS
                querySnapshot.forEach((doc) => {
                    let data = doc.data()

                    for (datapoint of data.sent) {
                        document.getElementById("msgs").insertAdjacentHTML("beforeend", `
                
                            <li class="card message" style="margin-top: 5px; width: 99%;">
                                <h5 style="display: inline; user-select: none;">${data.name}</h5>
                                <span style="margin-left: 20px;">${datapoint}</span>
                            </li>
                        
                        `)
                    }
                });
            }); */

            db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`)
                .onSnapshot((querySnapshot) => { // Add real time support
                    querySnapshot.forEach((doc) => {
                        let data = doc.data()

                        if (doc.id != "info") {
                            for (datapoint of data.sent) {
                                let msg = datapoint.split("!SHITCORD_STORE/:shitcord_token:yXA?U::/")[0]
                                let code = datapoint.split("!SHITCORD_STORE/:shitcord_token:yXA?U::/")[1]
                                let int = datapoint.split("!SHITCORD_STORE/:shitcord_token:dwA?U::/")[1]
                                if (!document.getElementById(data.name + ":" + datapoint + ":" + code) && datapoint.split("!SHITCORD_STORE/:shitcord_token:yXA?U::/")[2] == null) {
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

                if (message_form.msg.value != "" && message_form.msg.value != " " && message_form.msg.value != null && message_form.msg.value != "shitcord bad") {
                    db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            let data = doc.data()

                            db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc("info").get().then((doc) => {
                                let _data = doc.data()

                                if (data.name == user.displayName) {
                                    data.server_verified = true
                                    data.sent.push(message_form.msg.value + "!SHITCORD_STORE/:shitcord_token:yXA?U::/" + getString(8) + "!SHITCORD_STORE/:shitcord_token:dwA?U::/" + _data.total_msgs)

                                    db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc(user.displayName).set(data).then(() => {
                                        console.log("Written data.")
                                    }).catch((error) => {
                                        console.log(error)
                                    })
                                }

                                setTimeout(() => {
                                    _data.total_msgs = _data.total_msgs + 1
                                    db.collection(`servers/dev/${window.localStorage.getItem("current_channel")}`).doc("info").set(_data)
                                }, 100);
                            })
                        });
                    });

                    setTimeout(() => {
                        message_form.reset()
                    }, 500);
                }
            })
        } else {
            window.localStorage.setItem("current_channel", "general")
            window.reload()
        }
    }
});
