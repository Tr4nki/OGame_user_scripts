// ==UserScript==
// @name Display_Market_Ratio
// @description Display the ratio between currencies
// @copyright 2020, Tr4nki (https://openuserjs.org/users/Tr4nki)
// @license MIT
// @icon https://s168-es.ogame.gameforge.com/favicon.ico
// @homepageURL https://openuserjs.org/scripts/Tr4nki/Display_Market_Ratio
// @supportURL https://openuserjs.org/scripts/Tr4nki/Display_Market_Ratio/issues
// @version 1.0.1
// @updateURL https://openuserjs.org/meta/Tr4nki/Display_Market_Ratio.meta.js
// @downloadURL https://openuserjs.org/src/scripts/Tr4nki/Display_Market_Ratio.user.js
//
// @include https://*.ogame*gameforge.com/game/index.php?page=ingame&component=marketplace*
// @exclude https://*.ogame*gameforge.com/game/index.php?page=chat
// @exclude https://*.ogame*gameforge.com/game/index.php?page=messages

// @require https://openuserjs.org/src/scripts/Tr4nki/Marketplace_Ratio_Utils.user.js
// @require https://openuserjs.org/src/scripts/Tr4nki/Constants_Utils.user.js

// ==/UserScript==

// ==OpenUserJS==
// @author Tr4nki
// ==/OpenUserJS==

var unsafeWindow = window.wrappedJSObject;
const observed=document.querySelector(".items");
const config={childList:true};
var marketConstants=JSON.parse(localStorage.getItem("CLT_MPT_Marketplace_Constants"));

var sp=new URLSearchParams(location.href);
var component=sp.get("component");
var tab=sp.get("tab") || (unsafeWindow && unsafeWindow.marketplace && unsafeWindow.marketplace.tab);

if(component && component=="marketplace" && tab=="create_offer"){
	//debugger;
	ConstUtils.injectConstantsCollector();
}


if(observed && component=="marketplace" && (tab=="selling" || tab=="buying")){
	if(!marketConstants){
		openConstantsCollector();
	}else{
		calcRatios();
	}
}

function calcRatios(){
	var regExpItems = RegExp('\/cdn.+');

	var observer=new MutationObserver(function(mutationList,observer){
									mutationList.forEach((mutation) => {
										if(mutation.type="childList" && mutation.addedNodes.length>0){
											
											console.log("Added Nodes -> %O",mutation.addedNodes);
											var itemLines=mutation.target.querySelectorAll(".row");
											console.log(itemLines);
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
	
												var qttyToOffer=line.querySelector("div.info.price.center > div:nth-child(2)" + (tab=="selling"?" > span":"")).innerHTML;
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
												var ratioCalculator=new MP_Ratio_Utils(marketConstants);
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

												console.log(`Se busca ${qttyToBuyInt} de ${itemToBuy} por ${qttyOfferInt} cantidad de ${currency} . Ratio -> ${ratio}`);
	
											});
										}
									});
	});
	observer.observe(observed,config);
	//observer.disconnect();
}

function openConstantsCollector(){
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

	

