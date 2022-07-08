const configType='production'; //set to either production or debug
const config=require('./config.json');

const webhookid=config[configType].id;
const webhooktoken=config[configType].token;

const fs = require('fs');
var id=fs.readFileSync('last.txt','utf8');
console.log(id)
const phin = require("phin")
    .defaults({
    timeout: 12000
});
const Discord = require("discord.js");
const webhookClient = new Discord.WebhookClient({id:webhookid, token:webhooktoken});

let sleeptime=1000; //variable for how long it waits between requests, it changes depending on whether it found an item or not
const url="https://api.brick-hill.com/v1/shop/";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sendWebHookMessage(itemjson, messageEdit, timestamp){
	if (!timestamp) timestamp = new Date().toLocaleString() + " PST"
	let message = {
 		"content": "@everyone Item Found!! (" + (itemjson.type.type[0].toUpperCase()+itemjson.type.type.substring(1)) + ")" ,
 		"embeds": [
   			{
     				"title": itemjson.name,
    				"url": "https://www.brick-hill.com/shop/" + itemjson.id,
    				"color": 13632027,
    				"footer": { text:timestamp },
   				"thumbnail": {
  					"url": itemjson.thumbnail
   				},
				"description":"https://bricc-hill.com/shop/" + itemjson.id
  	 		}
 		]
	};
	if (itemjson.description) message.embeds[0].description=itemjson.description;
	try {
		if (!messageEdit) {
			webhookClient.send(message).then(function(msg) {
				setTimeout(async()=>{
					let data=await phin(url + itemjson.id);
					let jsondata=JSON.parse(data.body.toString()).data;
					sendWebHookMessage(jsondata,msg, timestamp);
				},5000);
			});
		} else {
			webhookClient.editMessage(messageEdit, message);
		};
	} catch(err) {
		console.warn(err);
		sendWebHookMessage(itemjson);
	};
};

async function doThing() {
	await sleep(sleeptime);
	try {
		let data = await phin(url + id);
		let JSONItemData = JSON.parse(data.body.toString());
		if (!JSONItemData.error && JSONItemData.data.creator.id==1003) {
			if (!JSONItemData.data.is_public) {
				sendWebHookMessage(JSONItemData.data);
			};
			console.log(id);
			id++;
			fs.writeFileSync('last.txt', id.toString());
			sleeptime=250;
		} else if (JSONItemData.error) {
			sleeptime=1000;
		} else {
			id++
			console.log(id);
			fs.writeFileSync('last.txt', id.toString());
			sleeptime=250;
		};
		doThing();
	} catch (error) {
		console.warn(error);
		doThing();
	};
};
doThing();
