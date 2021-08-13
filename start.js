const webhookid="869814769086001172"
const webhooktoken="YAWxkzDoTB268yZMzL2rZhd8bHDvAmo9bA0phofN9jCTHT37UulMLX-eFmIaz-XRXo-y"

//const webhookid="869787940438544444"
//const webhooktoken="tTTS6gtdV5zRCUE-KAf2COUp3448DB3Cdgbw1bWJ54eoOvbWnSC9h01EqsqP7QdCzO1d"

const sleep = require("sleep-promise")
const phin = require("phin")
    .defaults({
    timeout: 12000
});
const Discord = require("discord.js");
const webhookClient = new Discord.WebhookClient({id:webhookid, token:webhooktoken})

let sleeptime=100 //variable for how long it waits between requests, it changes depending on whether it found an item or not
let id=267982
const url="https://api.brick-hill.com/v1/shop/"

async function getThumbnail(message,id) {
	await sleep(15000)
	let data=await phin(url + id)
	let itemjson=JSON.parse(data.body.toString()).data
	try {
		let messageJSON = {
 			"content": "Item Found!!",
 			"embeds": [
   				{
     					"title": itemjson.name,
    					"url": "https://www.brick-hill.com/shop/" + itemjson.id,
					"color": 13632027,
					"timestamp": itemjson.created_at,
   					"thumbnail": {
  						"url": itemjson.thumbnail
   					}
  	 			}
 			]
		}
		if (itemjson.description) embed.embeds[0].description=itemjson.description
		webhookClient.editMessage(message.id,messageJSON)
	} catch(err) {
		console.warn(err)
		getThumbnail(message,id)
	}
}

function sendWebHookMessage(itemjson){
	let message = {
 		"content": "Item Found!!",
 		"embeds": [
   			{
     				"title": itemjson.name,
    				"url": "https://www.brick-hill.com/shop/" + itemjson.id,
    				"color": 13632027,
    				"timestamp": itemjson.created_at,
   				"thumbnail": {
  					"url": itemjson.thumbnail
   				}
  	 		}
 		]
	}
	if (itemjson.description) embed.embeds[0].description=itemjson.description
	try {
		webhookClient.send(message).then(function(message) {
			getThumbnail(message,itemjson.id)
		})
	} catch(err) {
		console.warn(err)
		sendWebHookMessage(itemjson)
	}
}

async function doThing() {
	await sleep(sleeptime)
	try {
		let data = await phin(url + id)
		let JSONItemData = JSON.parse(data.body.toString())
		if (!JSONItemData.error && JSONItemData.data.creator.id==1003) {
			if (!JSONItemData.data.is_public) {
				sendWebHookMessage(JSONItemData.data)
			}
			console.log(id)
			id++
			sleeptime=100
		} else if (JSONItemData.error && JSONItemData.error.message=="Record not found") {
			sleeptime=1000
		} else {
			if (JSONItemData.error) console.log(JSONItemData.error.message + " id: " + id)
			console.log(id)
			id++
			sleeptime=100
		}
		doThing()
	} catch (error) {
		console.warn(error)
		doThing()
	}
}
doThing()
