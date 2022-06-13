const got = require("got");
const fs = require("fs")
const {oauth, id, sha256Hash} = require("./options.json");
let output = []

sendNotification = async () => {
    let counter = 0
    for (let i = 0; i !== 1;) {
        const {body: data} = await got({
            method: "POST",
            url: "https://gql.twitch.tv/gql",
            responseType: "json",
            headers: {
                "Authorization": `OAuth ${oauth}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
                "Connection": "keep-alive",
                "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
            },
            body: JSON.stringify(
                [{
                    "operationName": "TransactionHistoryTab_UserPaymentTransactions",
                    "variables": {
                        "first": 100,
                        "after": counter.toString(),
                        "filters": {"userID": id, "sortBy": "PURCHASE_DATE_DESC", "type": "ALL"}
                    },
                    "extensions": {
                        "persistedQuery": {
                            "version": 1,
                            "sha256Hash": sha256Hash
                        }
                    }
                }])
        });
        counter = counter + 100
        if (!data[0].data["currentUser"]["paymentTransactions"]["edges"].length) {
            i = 1;
        }
        output = output.concat(data[0].data["currentUser"]["paymentTransactions"]["edges"])
    }
    analyze(output)

}
sendNotification()


async function analyze(input) {
    let moneycounter = 0
    let giftedSubs = 0
    let moneyForEachStreamer = {}
    let bits = 0
    input.forEach(item => {
            if (item.node.product.type !== "BITS") {
                if (item.node["isGift"]) {
                    giftedSubs = giftedSubs + item.node["quantity"]
                }
                if (item.node.paymentMethod["provider"] !== "PRIME" || item.node.paymentMethod["grossAmount"] !== null) {
                    moneycounter = moneycounter + item.node["grossAmount"]
                }

                if (!item.node.product?.owner?.login) {
                    console.log(item)
                }

                const providedChannel = item.node.product.owner.login
                if (!moneyForEachStreamer[providedChannel]) {
                    moneyForEachStreamer[providedChannel] = {
                        "yourself": {
                            "prime": 0,
                            "paid": {
                                "counter": 0,
                                "price": 0
                            }
                        },
                        "gifted": {
                            "counter": 0,
                            "price": 0,
                            "user": {},
                            "random": 0,
                        }
                    }
                }

                if (item.node.paymentMethod.provider === "PRIME") {
                    moneyForEachStreamer[providedChannel].yourself.prime++
                } else {
                    if (item.node.isGift) {
                        moneyForEachStreamer[providedChannel].gifted.counter++
                        moneyForEachStreamer[providedChannel].gifted.price = moneyForEachStreamer[providedChannel].gifted.price + item.node.grossAmount
                        if (item.node.recipient?.login) {
                            if (!moneyForEachStreamer[providedChannel].gifted.user[item.node.recipient.login]) {
                                moneyForEachStreamer[providedChannel].gifted.user[item.node.recipient.login] = {
                                    "months": 0
                                }
                            }
                            moneyForEachStreamer[providedChannel].gifted.user[item.node.recipient.login].months = moneyForEachStreamer[providedChannel].gifted.user[item.node.recipient.login].months + item.node.quantity
                        } else {
                            moneyForEachStreamer[providedChannel].gifted.random = moneyForEachStreamer[providedChannel].gifted.random + item.node.quantity
                        }
                    } else {
                        moneyForEachStreamer[providedChannel].yourself.paid.counter++
                        moneyForEachStreamer[providedChannel].yourself.paid.price = moneyForEachStreamer[providedChannel].yourself.paid.price + item.node.grossAmount
                    }
                }
            } else {
                bits = bits + parseInt(item.node.product.name)
            }
        }
    )
    Object.values(moneyForEachStreamer).forEach(item => {
        item.yourself.paid.price = getRightPrice(item.yourself.paid.price)
        item.gifted.price = getRightPrice(item.gifted.price)
    })
    await fs.writeFileSync("./output.json", JSON.stringify(moneyForEachStreamer, null, 4))
    console.log(`Gifted subs: ${giftedSubs}`)
    console.log(`Total money waste: ${moneycounter}`)
    console.log(`Total bits: ${bits}`)
    console.log("Take a look in output.json for more details")
}

function getRightPrice(value) {
    return value / 100
}