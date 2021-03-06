// ==UserScript==
// @name Display_Market_Ratio_PRE
// @description Display the ratio between currencies
// @copyright 2020, Tr4nki (https://openuserjs.org/users/Tr4nki)
// @license MIT
// @icon https://s168-es.ogame.gameforge.com/favicon.ico
// @homepageURL https://openuserjs.org/scripts/Tr4nki/Display_Market_Ratio_PRE
// @supportURL https://openuserjs.org/scripts/Tr4nki/Display_Market_Ratio_PRE/issues
// @version 2.0.0
// @updateURL https://openuserjs.org/meta/Tr4nki/Display_Market_Ratio_PRE.meta.js
// @downloadURL https://openuserjs.org/src/scripts/Tr4nki/Display_Market_Ratio_PRE.user.js
//
// @include https://*.ogame*gameforge.com/game/index.php?page=ingame&component=marketplace*
// @exclude https://*.ogame*gameforge.com/game/index.php?page=chat
// @exclude https://*.ogame*gameforge.com/game/index.php?page=messages

// @require https://openuserjs.org/src/libs/Tr4nki/MarketRatioUtilsLib.js
// @require https://openuserjs.org/src/libs/Tr4nki/ConstantsUtilLib.js

// ==/UserScript==
// Changes of this version: change requires for using it as libraries instead of user scripts
// ==OpenUserJS==
// @author Tr4nki
// ==/OpenUserJS==

var unsafeWindow;
if(navigator.userAgent.indexOf('Chrome')>-1){
    unsafeWindow = window.unsafeWindow;
}else if(navigator.userAgent.indexOf('Firefox')>-1){
    unsafeWindow = window.wrappedJSObject;
}

const observed=document.querySelector(".items");
const config={childList:true};
var marketConstants=JSON.parse(localStorage.getItem("CLT_MPT_Marketplace_Constants"));

var sp=new URLSearchParams(location.href);
var component=sp.get("component");	
var tab=sp.get("tab") || (unsafeWindow && unsafeWindow.marketplace && unsafeWindow.marketplace.tab);

if(component && component=="marketplace" && tab=="create_offer"){
	ConstUtils.injectConstantsColector();
}


if(observed && component=="marketplace" && (tab=="selling" || tab=="buying")){
	if(!marketConstants){
		openConstantsColector();
	}else{
		calcRatios();
	}
}

var ratioCalculator=new MP_Ratio_Utils(marketConstants);

function calcRatios(){
	var regExpItems = RegExp('\/cdn.+');

	var observer=new MutationObserver(function(mutationList,observer){
									mutationList.forEach((mutation) => {
										if(mutation.type="childList" && mutation.addedNodes.length>0){
											
											var itemLines=mutation.target.querySelectorAll(".row");
											
											itemLines.forEach(function(line){
												var itemOptions;
												var ratio;
	
												var itemToBuy=line.querySelector("div.info.details > h3:nth-child(1) > span").innerHTML;
												//console.log("line vendido -> %s",tradeObjectElement);
	
												var qttyToBuy=line.querySelector("div.info.details > .quantity").innerHTML;
												//console.log("Cantidad -> %s",qttyToBuy);
	
												var currencyClass=line.querySelector("div.right > div:nth-child(1) > div:nth-child(1)").className.split(" ");
												var currency=currencyClass[currencyClass.length-1];
												//console.log("Recurso pedido -> %s",currency);
	
												var qttyToOffer=line.querySelector("div.info.price.center > .quantity" + (tab=="selling"?" > span":"")).innerHTML;
												//console.log("Cantidad recurso pedido -> %s",qttyToOffer);
	
												var tradeObjectElement=line.querySelector("div.left *:nth-child(1)" + (tab=="selling"?"":" > div:nth-child(1)"));
	
												var qttyOfferInt=parseInt(qttyToOffer.replace(/\./g,""));
												var qttyToBuyInt=parseInt(qttyToBuy.replace(/\./g,""));
	
												if(tradeObjectElement.tagName=="IMG"){
													var res=regExpItems.exec(tradeObjectElement.src);
													if(res!=null){
														itemOptions=marketConstants.objectTradeOptions[marketConstants.htmlIDs_objectValues[res[0]]];
												}
												else{
													//console.log("cadena no encontrada -> %s",tradeObjectElement.src);
												}
												}else if(tradeObjectElement.tagName=="DIV"){
													itemOptions=marketConstants.objectTradeOptions[marketConstants.htmlIDs_objectValues[tradeObjectElement.className]];
												}
												ratio=ratioCalculator.calcRatio(itemOptions,qttyOfferInt,currency,qttyToBuyInt,null,null);
												var customRatioContainer=document.createElement("div");
												var contentRatioFlex=document.createElement("div");
												var contentRatioData=document.createElement("span");
												customRatioContainer.className="col w-120 customRatio";
												contentRatioFlex.style="display: flex;align-items: center;justify-content: center;height: 60px;";
												contentRatioFlex.className="contentRatio";
												contentRatioData.innerHTML=(Math.round(ratio*100)) + " % del precio de coste (en MCD)";

												contentRatioFlex.appendChild(contentRatioData);
												customRatioContainer.appendChild(contentRatioFlex);
												
												line.insertBefore(customRatioContainer,line.querySelector("div:nth-of-type(3)"));

												//console.log(`Se busca ${qttyToBuyInt} de ${itemToBuy} por ${qttyOfferInt} cantidad de ${currency} . Ratio -> ${ratio}`);
	
											});
										}
									});
	});
	observer.observe(observed,config);
	//observer.disconnect();
}

function openConstantsColector(){
	var constantsTab=this.open(location.origin+"/game/index.php?page=ingame&component=marketplace&tab=create_offer");
	this.addEventListener("message",function(ev){
		var msg=ev.data;
		if(msg=="done"){
			constantsTab.close();
			location.reload();
			//add a green icon somewhere
		}else{
			//add a red icon somewhere
		}
	},false);
}

	

