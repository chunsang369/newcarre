//=============================================================================+
// nTree
//-----------------------------------------------------------------------------+
function nTreeCar(cfg)
{
	this.ele = cfg.ele;
	this.cfg = cfg.cfg;
	this.env = cfg.env;

	this.ajax = {};
	this.evt = {};

	this.init(cfg);

	return this;
}

nTreeCar.prototype = {
	init: function(env)
	{
		var t = this;
		// console.log($(t.ele.estimateWrap));

		if(!t.ele)
		{
			t.ele = {};
		}
		if(!t.cfg)
		{
			t.cfg = {};
		}
		if(!t.env)
		{
			t.env = {};
		}

		if(t.ele.estimateWrap)
		{
			// $(t.ele.estimateWrap).off('click');
			$(t.ele.estimateWrap).off('change');

			$(t.ele.estimateWrap).on('change', function(evt) {

				// console.log(evt);
				// console.log($(evt.target), $(evt.target).attr('data-prevent'));


// 					var nodeName = evt.target.nodeName;
// 					var checkNode = false;
//
// 					if(nodeName == 'LABEL' || nodeName == 'INPUT')
// 					{
// 						checkNode = true;
// 					}
// 					else if($(evt.target).parents('label, input').length > 0)
// 					{
// 						checkNode = true;
// 					}
//
// 					if(checkNode && t.env.pack && t.env.pack.param && t.env.pack.param.idxMark)
// 					{
// 						if(confirm('빠른출고 상품으로서 옵션을 변경하면 빠른출고가 불가능합니다.\n변경하시겠습니까?'))
// 						{
// 							t.env.pack.param.idxMark = false;
// 							$('*[name="input[idxMark]"]').val('');
// 						}
// 						else
// 						{
// 							evt.preventDefault();
// 						}
// 					}




				t.estimateCheck(this)
			});

			t.estimateCheck(this);
		}
		if(t.ele.treeWrap)
		{
			$(t.ele.treeWrap).off('change');

			t.ele.treeWrapEvt = null;
			$(t.ele.treeWrap).on('change click', function(evt) {


				t.ele.treeWrapEvt = evt;

				if(evt.type == 'change')
				{
					t.treeCheck(this)
				}

				setTimeout(function(){
					if(t.ele.treeWrapEvt.type == 'click')
					{
						if($(t.ele.treeWrapEvt.target).is(':checked') == true)
						{
							if($(t.ele.treeWrapEvt.target).is(':checked'))
							{
								$(t.ele.treeWrapEvt.target).attr('checked', false);
								$(t.ele.treeWrapEvt.target).prop('checked', false);
								t.treeCheck(this)
							}
							// console.log($(t.ele.treeWrapEvt.target).is(':checked'), t.ele.treeWrapEvt.target);
						}
					}
					// console.log(t.ele.treeWrapEvt.type);
				}, 100);
				// console.log($(evt.target).is(':checked'), evt);
			});

			t.treeCheck(this)

			// $(t.ele.treeWrap).change(function(){
			// 	t.treeCheck(this)
			// });


		}

		return t;
	}
	,chgCond:function(e)
	{
		var wrap = $(e);
		var thumbAngle = wrap.find('*[name="thumbAngle"]:checked').val();

		var thumbs = wrap.find('.swiper-slide');

		thumbs.hide();

		wrap.find('.swiper-slide[data-color-name*="'+thumbAngle+'"]');

		if(thumbAngle == 'side')
		{
			wrap.find('.swiper-slide[data-color-name*="left"]');
			wrap.find('.swiper-slide[data-color-name*="right"]');
		}

		target.show();
		//console.log(target);
	}
	,chgGrade:function(req)
	{
		var ele = $(req.ele).find('*:checked');
		var text = ele.text();

		if(req.val)
		{
			text = req.val;
		}

		var count = 0;

		count += $('*[data-img-grade="'+text+'"]').length;

		if(count > 0)
		{
			// console.log(ele, text, count);

			$('*[data-img-grade]').hide();
			$('*[data-img-grade]').addClass('disabled');
			// $('*[data-img-grade=""]').show();
			$('*[data-img-grade="'+text+'"]').show();
			$('*[data-img-grade="'+text+'"]').removeClass('disabled');
		}
		else
		{
			$('*[data-img-grade]').show();
			$('*[data-img-grade]').removeClass('disabled');
		}

		if(typeof(swiperUpdate) == 'function')
		{
			swiperUpdate();
		}
	}
	,chgTrim:function(req)
	{
		console.log('chgTrim');
		var t = this;

		// var ele = $(req.ele).find('*:checked');
		// var text = ele.text();

		console.log(t.env.color);

		if(req.val)
		{
			req.trim = req.val;
		}


		if(req.grade && req.grade != '')
		{
			req.grade = req.grade.replace(/\((.*?)\)/, '').trim();
			req.grade = req.grade.replace(/(2WD|AWD)/, '').trim();
			t.env.grade = req.grade;
		}
		else if(t.env.grade)
		{
			req.grade = t.env.grade;
		}
		else
		{
			req.grade = '';
		}

		if(req.trim && req.trim != '')
		{
			req.trim = req.trim.replace(/\((.*?)\)/, '').trim();
			req.trim = req.trim.replace(/(2WD|AWD)/, '').trim();
			t.env.trim = req.trim;
		}
		else if(t.env.trim)
		{
			req.trim = t.env.trim;
		}
		else
		{
			req.trim = '';
		}



		var countTrim = 0;
		countTrim += $('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"]').length;

		var countAngle = 0;
		countAngle += $('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"][data-img-angle="'+t.env.angle+'"]').length;

		if(t.env.angle == 'side')
		{
			countAngle += $('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"][data-img-angle="left"]').length;
			countAngle += $('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"][data-img-angle="right"]').length;
		}

		var countColor = 0;
		countColor += $('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"][data-img-angle="'+t.env.angle+'"][data-img-color="'+t.env.color+'"]').length;

		if(t.env.angle == 'side')
		{
			countColor += $('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"][data-img-angle="left"][data-img-color="'+t.env.color+'"]').length;
			countColor += $('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"][data-img-angle="right"][data-img-color="'+t.env.color+'"]').length;
		}

		var countColorOnly = 0;
		countColorOnly += $('*[data-img-angle="'+t.env.angle+'"][data-img-color="'+t.env.color+'"]').length;

		if(t.env.angle == 'side')
		{
			countColorOnly += $('*[data-img-angle="left"][data-img-color="'+t.env.color+'"]').length;
			countColorOnly += $('*[data-img-angle="right"][data-img-color="'+t.env.color+'"]').length;
		}

		// console.log(req);
		// console.log(countTrim, countAngle, countColor, countColorOnly);

		if(countColor > 0)
		{
			$('*[data-img-grade][data-img-trim]').hide();
			$('*[data-img-grade][data-img-trim="'+req.trim+'"][data-img-angle="'+t.env.angle+'"][data-img-color="'+t.env.color+'"]').show();

			if(t.env.angle == 'side')
			{
				$('*[data-img-grade][data-img-trim="'+req.trim+'"][data-img-angle="right"][data-img-color="'+t.env.color+'"]').show();
				$('*[data-img-grade][data-img-trim="'+req.trim+'"][data-img-angle="left"][data-img-color="'+t.env.color+'"]').show();
			}
		}
		else if(countColorOnly > 0)
		{
			$('*[data-img-grade][data-img-trim]').hide();
			$('*[data-img-grade][data-img-trim][data-img-angle="'+t.env.angle+'"][data-img-color="'+t.env.color+'"]').show();

			if(t.env.angle == 'side')
			{
				$('*[data-img-grade][data-img-trim][data-img-angle="right"][data-img-color="'+t.env.color+'"]').show();
				$('*[data-img-grade][data-img-trim][data-img-angle="left"][data-img-color="'+t.env.color+'"]').show();
			}
		}
		else if(countAngle > 0)
		{
			$('*[data-img-grade][data-img-trim]').hide();
			$('*[data-img-grade][data-img-trim="'+req.trim+'"][data-img-angle="'+t.env.angle+'"]').show();

			if(t.env.angle == 'side')
			{
				$('*[data-img-grade][data-img-trim="'+req.trim+'"][data-img-angle="right"]').show();
				$('*[data-img-grade][data-img-trim="'+req.trim+'"][data-img-angle="left"]').show();
			}
		}
		else if(countTrim > 0)
		{
			$('*[data-img-grade][data-img-trim]').hide();
			$('*[data-img-grade][data-img-trim="'+req.trim+'"]').show();
		}
		else
		{
			$('*[data-img-grade][data-img-trim]').show();
			$('*[data-img-grade][data-img-trim]').removeClass('disabled');
		}

		if(t.env.angle == 'front')
		{
			$('*[data-img-angle="side"]').hide();
			$('*[data-img-angle="left"]').hide();
			$('*[data-img-angle="right"]').hide();
			$('*[data-img-angle="back"]').hide();
		}
		else if(t.env.angle == 'side')
		{
			$('*[data-img-angle="front"]').hide();
			$('*[data-img-angle="back"]').hide();
		}
		else if(t.env.angle == 'back')
		{
			$('*[data-img-angle="front"]').hide();
			$('*[data-img-angle="side"]').hide();
			$('*[data-img-angle="left"]').hide();
			$('*[data-img-angle="right"]').hide();
		}

		if(typeof(swiperUpdate) == 'function')
		{
			swiperUpdate();
		}
	}
	,chgColor:function(req)
	{
		var t = this;

		// console.log(req);


		if(req.ele.form)
		{
			req.form = req.ele.form;
		}
		else
		{
			req.form = $(req.ele).parents('form');
		}


		if(req && !req.ele)
		{
			req.ele = req;
		}

		// req.wrap = req.ele.form;

		// req.grade = req.form.find('select[name="input[idxGrade]"]').find('*:checked').text();
		// req.trim = req.form.find('select[name="input[idxTrim]"]').find('*:checked').text();


		req.grade = t.env.grade;
		req.trim = t.env.trim;





		// console.log($('select[name="input[idxTrim]"]:selected'));


		if(req.grade)
		{
			req.grade = req.grade.replace(/\((.*?)\)/, '').trim();
			req.grade = req.grade.replace(/(2WD|AWD)/, '').trim();
		}
		else
		{
			req.grade = '';
		}

		if(req.trim)
		{
			req.trim = req.trim.replace(/\((.*?)\)/, '').trim();
			req.trim = req.trim.replace(/(2WD|AWD)/, '').trim();
		}
		else
		{
			req.trim = '';
		}


		var wrap = $(req.ele);
		// var wrapUpdate = wrap.attr('data-color-btn-update');

		if(!req.color)
		{
			var item = wrap.find('input:checked');
			req.color = item.attr('data-color-btn-name')
		}

		t.env.color = req.color;

		if(!req.group)
		{
			req.group = group = wrap.attr('data-color-btn-group');
		}


		req.groupEle = $('*[data-color-group="'+req.group+'"]');


		$('*[data-tab="thumb-tab-ext"]').removeClass('active');
		$('*[data-tab="thumb-tab-int"]').removeClass('active');
		$('*[data-tab="thumb-tab-gal"]').removeClass('active');

		$('*[data-tab="thumb-tab-' + req.group + '"]').addClass('active');

		if(req.group == 'int')
		{
			$('*[data-color-group="int"]').show();
			$('*[data-color-group="ext"]').hide();
		}
		else if(req.group == 'ext')
		{
			$('*[data-color-group="int"]').hide();
			$('*[data-color-group="ext"]').show();
		}


		var count = 0;
		count += req.groupEle.find('*[data-img-grade="'+req.grade+'"][data-img-trim="'+req.trim+'"][data-color="'+req.color+'"]').length;

		req.groupEle.find('*[data-color]').hide();

		var tgtItem = null;

		if(count == 0)
		{
			tgtItem = req.groupEle.find('*[data-color="'+req.color+'"]');
		}
		else
		{
			tgtItem = req.groupEle.find('*[data-img-grade][data-img-trim="'+req.trim+'"][data-color="'+req.color+'"]');
		}

		if(tgtItem.length == 0)
		{
			req.groupEle.find('*[data-img-grade][data-img-trim][data-color]').show();
		}
		else
		{
			tgtItem.show();

			console.log(tgtItem.length);

			var tgtImgs = tgtItem.find('img');
			var modelThumb = tgtImgs[0].getAttribute('src');
			$('img[data-ntreecar-info="modelThumb"]').attr('src', modelThumb);
		}


		// console.log(req, t.env);



		if(typeof(swiperUpdate) == 'function')
		{
			swiperUpdate();
		}
	}
	,eleSerialArray:function(ele)
	{
		var eleArr = $(ele).find('select, input[type="text"], input[type="hidden"], input[type="radio"], input[type="checkbox"]:checked');

		var formArr = [];

		// console.log(eleArr);

		for(var eleIdx = 0; eleIdx < eleArr.length; eleIdx++)
		{
			var itemDataName = $(eleArr[eleIdx]).attr('data-name');
			var itemName = $(eleArr[eleIdx]).attr('name');
			var itemType = $(eleArr[eleIdx]).attr('type');
			var itemTag = $(eleArr[eleIdx])[0].nodeName;
			var itemVal = $(eleArr[eleIdx]).val();
			var itemDef = $(eleArr[eleIdx]).attr('default');

			if(itemDataName)
			{
				itemName = 'input['+itemDataName+']';
			}

			if(itemType == 'radio')
			{
				itemVal = $(ele).find('input[type="radio"][name="'+itemName+'"]:checked').val();
			}
			if(itemType == 'checkbox')
			{
				// itemVal = $(ele).find('input[type="checkbox"][name="'+itemName+'"]:checked').val();
			}

			// console.log(itemType, itemName, !itemVal);

			if(itemVal)
			{
				formArr.push({
					name:itemName
					,value:itemVal
				});
			}
			else if(itemDef != '')
			{
				formArr.push({
					name:itemName
					,value:itemDef
				});
			}
		}

		// console.log(formArr);

		return formArr;

	}
	,eleDisplay:function(parent, data)
	{
		var t = this;

		var param = {};

		var thumbSrc = null;
		var thumbEle = parent.find('*[data-nTreeCar-info="modelThumb"]');

		for(var treeKey in data.tree)
		{
			var treeData = data.tree[treeKey];
			// var treeIdx = treeData['idx'];

			// console.log(treeKey);


			var treeEle = parent.find('*[name="input['+treeKey+']"], *[name="inputCar['+treeKey+']"], *[data-name="'+treeKey+'"]');
			treeEle.removeAttr('default');

			var wrapEle = parent.find('*[data-nTreeCar-ele="wrap['+treeKey+']"]');
			var wrapDef = wrapEle.attr('data-nTreeCar-def');
			wrapEle.removeAttr('data-nTreeCar-def');


			if(wrapDef == undefined)
			{
				wrapDef = '';
			}

			var tempEle = parent.find('*[data-nTreeCar-ele="temp['+treeKey+']"]').clone();
			tempEle.attr('data-nTreeCar-ele', '');

			var tempHtml = false;
			if(tempEle.length > 0)
			{
				tempHtml = tempEle[0].outerHTML;
			}

			var treeEleTag = '';
			if(treeEle.length > 0)
			{
				treeEleTag = treeEle[0].nodeName;
			}


			if(treeEle.attr('data-opt') == 'fastCnt')
			{
				for(var dataKey in treeData)
				{
					if(treeData[dataKey]['markFastCnt'] > 0)
					{
						treeData[dataKey]['title'] = treeData[dataKey]['title'] + '(' + treeData[dataKey]['markFastCnt']+'종류 보유)';
					}
				}
			}

			// console.log(treeData);


			if(tempHtml)
			{

				if(typeof(wrapEle.parent()[0].swiper) == 'object')
				{
					var swiper = wrapEle.parent()[0];
					// swiper.destroy();
					// swiper.slideTo(0, 0, function(){ console.log(1); });
					// swiper.removeAllSlides();
					// console.log('go 0');

					// for (let i = swiper.slides.length - 1; i >= 0; i--) {
					// 	swiper.removeSlide(i);
					// }
				}
				else
				{
				}

				wrapEle.children('*[data-opt!="keep"]').remove();

				for(var itemSeq in treeData)
				{
					var itemData = treeData[itemSeq];
					var itemIdx = itemData['idx'];
					var itemJson = JSON.stringify(itemData);
					var itemHtml = tempHtml;

					itemHtml = itemHtml.replace(/\{idx\}/g, itemIdx);
					itemHtml = itemHtml.replace(/\{json\}/g, itemJson);


					// if(itemData['priceMonthRentMin'])
					// {
					// 	console.log(itemData);
					// }

					// priceMonthRentMin
					// priceMonthLeaseMin


					if(!itemData['priceMonth'])
					{
						itemData['priceMonth'] = '상담문의';
					}

					if(!itemData['priceMonthMin'] || itemData['priceMonthMin'] == 0)
					{
						itemData['priceMonthMin'] = '상담문의';
					}

					if(!itemData['priceMonthMin@f'] || itemData['priceMonthMin@f'] == 0)
					{
						itemData['priceMonthMin@f'] = '상담문의';
					}
					if(itemData['modelMark'] != '')
					{
						itemData['priceMonth'] = itemData['modelMark'];
						itemData['priceMonthMin'] = itemData['modelMark'];
					}


					if(
						Number.isInteger(parseInt(itemData['priceMonthMin']))
						&& parseInt(itemData['priceMonthMin']) > 0
					)
					{
						itemData['priceMonthMin@h'] = '월 ' + itemData['priceMonthMin@f'] + '원';
					}
					else
					{
						itemData['priceMonthMin@h'] = '' + itemData['priceMonthMin'] + '';
					}


					for(var itemKey in itemData)
					{
						var itemVal = itemData[itemKey];


						if(
							itemKey.indexOf('price') >= 0
							&& !itemKey.indexOf('@')
							&& parseInt(itemVal) > 0
						)
						{
							itemHtml = itemHtml.replace(new RegExp('\{'+itemKey+'\}', 'g'), util.numberFormat(itemVal));
						}
						else
						{
							itemHtml = itemHtml.replace(new RegExp('\{'+itemKey+'\}', 'g'), itemVal);
						}
					}







					var itemObj = $(itemHtml).css('display', '');
					itemObj.attr('data-opt', '');

					if(!itemData['priceMonthRentMin@f'] || itemData['priceMonthRentMin@f'] == '0' || itemData['priceMonthRentMin@f'] == '상담문의')
					{
						itemObj.find('*[data-nTreeCar-info-unit="priceMonthRentMin"]').hide();
					}
					if(!itemData['priceMonthLeaseMin@f'] || itemData['priceMonthLeaseMin@f'] == '0' || itemData['priceMonthLeaseMin@f'] == '상담문의')
					{
						itemObj.find('*[data-nTreeCar-info-unit="priceMonthLeaseMin"]').hide();
					}



					// console.log(wrapDef);

					if(itemData.active || wrapDef.indexOf('|'+itemIdx+'|') >= 0 || wrapDef == itemData.title)
					{
						// console.log(1);
						itemObj.addClass('active');
						itemObj.find('input[type="radio"], input[type="checkbox"]').attr('checked', true);
					}
					else
					{
						itemObj.removeClass('active');
					}

					wrapEle.append(itemObj);


				}
			}
			else if(treeEleTag == 'SELECT')
			{
				// treeEle.html('');
				treeEle.find('option[data-opt!="keep"]').remove();
				treeEle.val('');

				var treeDataSort = {};

				if(treeEle.attr('data-sort') == 'title')
				{

					var treeDataSortKey = new Array();

					for(var itemKey in treeData)
					{
						treeDataSortKey.push(treeData[itemKey].title);
					}

					treeDataSortKey.sort();

					for(var treeDataSortIdx in treeDataSortKey)
					{
						var treeDataSortWord = treeDataSortKey[treeDataSortIdx];

						for(var itemKey in treeData)
						{
							var itemData = treeData[itemKey];

							if(itemData.title == treeDataSortWord)
							{
								treeDataSort[itemKey] = itemData;
								continue;
							}
						}
					}

				}
				else
				{
					treeDataSort = treeData;
				}

				for(var itemKey in treeDataSort)
				{
					var itemData = treeDataSort[itemKey];
					var itemIdx = itemData['idx'];

					if(!itemData.link)
					{
						itemData.link = '';
					}


					if(!thumbSrc && itemData.active && itemData.modelThumbLeft)
					{
						thumbSrc = itemData.modelThumbLeft;
						console.log(itemData);
					}

					if(!itemIdx && itemData['idxName'] && itemData['idxModel'])
					{
						itemIdx = itemData['idxName'] + '|' + itemData['idxModel'];
					}

					if(itemData.active)
					{
						param[treeKey] = itemIdx;

						treeEle.val(itemIdx);
						treeEle.append('<option value="'+itemIdx+'" data-link="'+itemData.link+'" selected>'+itemData.title+'</option>');
					}
					else
					{
						treeEle.append('<option value="'+itemIdx+'" data-link="'+itemData.link+'">'+itemData.title+'</option>');
					}

					//

					// console.log(itemData);
				}



				if(treeKey == 'idxTrim')
				{
					// treeEle.trigger('change');
				}
				//

				// console.log(treeKey, treeEle.val());
			}



			// console.log(treeEle, treeEleTag, treeData);
			// console.log(treeEle);
		}

		if(thumbSrc)
		{
			thumbEle.attr('src', thumbSrc);
		}

		if(param.idxGrade && $('*[data-tab-id="#tab-grade-'+param.idxGrade+'"]').attr('class') != 'active')
		{
			// var
			$('*[data-tab-id="#tab-grade-'+param.idxGrade+'"]').trigger('click');
		}
		if(param.idxTrim)
		{
			var itemTrim = $('#trim-'+param.idxTrim);

			if(!itemTrim.prop('checked'))
			{
				$('#trim-'+param.idxTrim).prop("checked", true).trigger('change');
			}
		}



	}
	,basketAdd(req)
	{
		var t = this;

		var selObj = $(t.ele.treeWrap); // .find('*[name^="input[nTreeCar]"]');
		var formArr = t.eleSerialArray(selObj);

		if(req.type)
		{
			formArr.push({
				name:'input[type]'
				,value:req.type
			});
		}

		var nTreeCarMulti = $('*[data-nTreeCar-basket="nTreeCarMulti"]').val();

		if(nTreeCarMulti)
		{
			formArr.push({
				name:'input[nTreeCarMulti]'
				,value:nTreeCarMulti
			});
		}

		t.ajax.treeCheck = $.ajax({
			url:'/app/nTreeCar/basketAdd/'
			,type:'POST'
			,dataType:'JSON'
			,data:formArr
			,success:function(result)
			{
				$('*[data-nTreeCar-basket="nTreeCarMulti"]').val('');
				$(t.ele.basketWrap).html('');

				if(result.basket)
				{
					if(result.basket.nTreeCarMulti)
					{
						$('*[data-nTreeCar-basket="nTreeCarMulti"]').val(result.basket.nTreeCarMulti);
					}
					if(result.basket.nTreeCarMultiParse[req.type])
					{
						var html = '';

						for(var key in result.basket.nTreeCarMultiParse[req.type])
						{
							var row = result.basket.nTreeCarMultiParse[req.type][key];

							if(row)
							{
								html += '<span class="label label-info" data-nTreeCar-basket-type="'+req.type+'" data-nTreeCar-basket-code="'+row.code+'">'+row.title+' <i class="fas fa-trash-alt" onclick="basketRemove({type:\''+req.type+'\', code:\''+row.code+'\', ele:this})"></i></span> ';
							}

						}

						$(t.ele.basketWrap).html(html);

						// console.log(key, val);

					}

				}
			}
		});

	}
	,treeCheck:function(e)
	{
		var t = this;

		var formArr = t.eleSerialArray(t.ele.treeWrap);

		// console.log(formArr);


		$(t.ele.treeWrap).find('*[data-nTreeCar-ele^="wrap"]').css('opacity', '0.5');

		t.ajax.treeCheck = $.ajax({
			url:'/app/nTreeCar/treeCheck/'
			,type:'POST'
			,dataType:'JSON'
			,data:formArr
			,success:function(result)
			{

				$(t.ele.treeWrap).find('*[data-nTreeCar-ele^="wrap"]').css('opacity', '');

				if(result.link)
				{
					for(var key in result.link)
					{
						var val = result.link[key];
						$(t.ele.treeWrap).find('*[data-nTreeCar-link="'+key+'"]').attr('href', val);
					}
				}

				var wrapUpdate = $(t.ele.treeWrap).attr('data-nTreeCar-update');

				// console.log(result.tree);


				if(result.tree)
				{
					t.eleDisplay($(t.ele.treeWrap), result);
				}

				if(wrapUpdate)
				{
					formArr = t.eleSerialArray(t.ele.treeWrap);
					// console.log(wrapUpdate);
					eval(wrapUpdate);
				}

			}
		});


		// console.log(formArr, eleArr);
	}
	,estimateCheck:function(e)
	{
		var t = this;



		// var formArr = $(t.ele.estimateWrap).serializeArray();

		// $('*[default]').formDefault();

		var formArr = t.eleSerialArray($(t.ele.estimateWrap));


		$('*[data-ajax-mode="disable"]').attr('disabled', true);
		$('*[data-ajax-mode="disable"]').prop('disabled', true);
		$('*[data-ajax-mode="disable"]').addClass('disabled');


		// console.log(t.env);

		var connEle = $('*[data-nTreeCar-conn]');
		var connTgt = connEle.attr('data-nTreeCar-conn');
		var connParam = {};
		var pageCode = $(t.ele.estimateWrap).find('*[name="input[pageCode]"]').val();

		// console.log(t.ajax);

		if(t.ajax.estimateCheck)
		{
			t.ajax.estimateCheck.abort();
		}

		//

		// $('*[data-nTreeCar-act="numRandom"]').hide();

		var randEles = $('*[data-nTreeCar-act="numRand"]');

		for(var randEle of randEles)
		{
			var randObj = $(randEle);

			var randNum = randObj.html();
			randNum = parseInt(randNum.replace(/,/g, ''));

			if(randNum)
			{
				randObj.attr('data-nTreeCar-info-org', randNum);
				randObj.prop('data-nTreeCar-info-org', randNum);
				// console.log(randNum);
			}
		}

		clearInterval(t.evt.numRandIv);
		t.evt.numRandIv = setInterval(function(){
			// console.log(randEles);

			for(var randEle of randEles)
			{
				// var org = $('*[data-nTreeCar-info="'+key+'"]').html();

				var randObj = $(randEle);

				var randNum = randObj.html();
				randNum = parseInt(randNum.replace(/,/g, ''));

				var randOrg = randObj.attr('data-nTreeCar-info-org');

				if(randOrg)
				{
					var randMin = parseInt(randOrg * 0.9);
					var randMax = parseInt(randOrg * 1.1);
					var randView = Math.floor((Math.random() * (randMax - randMin)) + randMin);


					randObj.html(util.numberFormat(randView));
					// console.log(randOrg, randMin, randMax, randView);
				}
			}



		}, 50);



		t.ajax.estimateCheck = $.ajax({
			url:'/app/nTreeCar/estimateCheck/'
			,type:'POST'
			,dataType:'JSON'
			,data:formArr
			,success:function(result)
			{
				clearInterval(t.evt.numRandIv);

				var wrapUpdate = $(t.ele.treeWrap).attr('data-nTreeCar-update');

				$('*[data-ajax-mode="disable"]').attr('disabled', false);
				$('*[data-ajax-mode="disable"]').prop('disabled', false);
				$('*[data-ajax-mode="disable"]').removeClass('disabled');


				// console.log(result.info);

				if(result.tree)
				{
					t.eleDisplay($(t.ele.estimateWrap), result);
				}

				if(wrapUpdate)
				{
					formArr = t.eleSerialArray(t.ele.treeWrap);
					// console.log(wrapUpdate);
					eval(wrapUpdate);
				}


				if(result.link)
				{
					for(var key in result.link)
					{
						var val = result.link[key];
						$('*[data-nTreeCar-link="'+key+'"]').attr('href', val);
					}
				}
				if(result.info)
				{
					t.env.maker = result.info.maker;
					t.env.name = result.info.name;
					t.env.model = result.info.model;
					t.env.grade = result.info.grade;
					t.env.trim = result.info.trim;

					// 이미지
					if(result.info.imgParse)
					{
						if(result.info.imgParse.ext)
						{
							if(result.info.imgParse.ext.left[0])
							{
								t.ele.estimateWrap.find('img[data-ntreecar-info-img="extLeftSrc"]').attr('src', result.info.imgParse.ext.left[0]['thumb']);
							}
						}
					}

					if(result.info.recom)
					{
						if(result.info.recom.best)
						{
							if(result.info.recom.best.priceMonth <= 0)
							{
								result.info.recom.best.priceMonth = '상담문의';
							}

							for(var key in result.info.recom.rent)
							{
								result.info['[recom][best]'+key] = result.info.recom.rent[key];
							}
						}
						else
						{
							result.info['[recom][best]priceMonth'] = '상담문의';
						}

						if(result.info.recom.rent)
						{
							if(result.info.recom.rent.priceMonth <= 0)
							{
								result.info.recom.rent.priceMonth = '상담문의';
							}

							for(var key in result.info.recom.rent)
							{
								result.info['[recom][rent]'+key] = result.info.recom.rent[key];
							}
						}
						else
						{
							result.info['[recom][rent]priceMonth'] = '상담문의';
						}

						if(result.info.recom.lease)
						{
							if(result.info.recom.lease.priceMonth <= 0)
							{
								result.info.recom.lease.priceMonth = '상담문의';
							}
							for(var key in result.info.recom.lease)
							{
								result.info['[recom][lease]'+key] = result.info.recom.lease[key];
							}
						}
						else
						{
							result.info['[recom][lease]priceMonth'] = '상담문의';
						}


						if(result.info.modelMark)
						{
							result.info['[recom][best]priceMonth'] = result.info.modelMark;
							result.info['[recom][rent]priceMonth'] = result.info.modelMark;
							result.info['[recom][lease]priceMonth'] = result.info.modelMark;
						}
					}

					if(pageCode)
					{
						connParam['input[pageCode]'] = pageCode;
					}

					connParam['inputCar[idxMaker]'] = result.info.idxMaker;
					connParam['inputCar[idxName]'] = result.info.idxName;
					connParam['inputCar[idxModel]'] = result.info.idxModel;
					connParam['inputCar[idxGrade]'] = result.info.idxGrade;
					connParam['inputCar[idxTrim]'] = result.info.idxTrim;

					connParam['inputCar[maker]'] = result.info.maker;
					connParam['inputCar[name]'] = result.info.name;
					connParam['inputCar[model]'] = result.info.model;
					connParam['inputCar[grade]'] = result.info.grade;
					connParam['inputCar[trim]'] = result.info.trim;


					connParam['inputCar[idxOptStr]'] = '';
					connParam['inputCar[option]'] = '';

					if(!result.info['priceMonthFnApi'])
					{
						result.info['priceMonthFnApi'] = '상담문의';
					}
					if(!result.info['priceMonth'])
					{
						result.info['priceMonth'] = '상담문의';
					}
					if(!result.info['priceMonthMin'])
					{
						result.info['priceMonthMin'] = '상담문의';
					}
					if(result.info['modelMark'] != '')
					{
						result.info['priceMonth'] = result.info['modelMark'];
						result.info['priceMonthMin'] = result.info['modelMark'];
					}



					if(parseInt(result.info['priceTrimSale']) >= 10000)
					{
						$('#viewSlide').addClass('trimSale');
						$('*[data-nTreeCar-info-wrap="priceTrimSale"]').show();
					}
					else
					{
						$('#viewSlide').removeClass('trimSale');
						$('*[data-nTreeCar-info-wrap="priceTrimSale"]').hide();
					}


					// data-ntreecar-info
					if(result.info.trimEngineEff > 0)
					{
						$('*[data-nTreeCar-info-wrap="trimEngineEff"]').show();
						$('*[data-nTreeCar-info-wrap="trimEleEff"]').hide();
					}
					else if(result.info.trimEleEff > 0)
					{
						$('*[data-nTreeCar-info-wrap="trimEngineEff"]').hide();
						$('*[data-nTreeCar-info-wrap="trimEleEff"]').show();
					}
					else
					{
						$('*[data-nTreeCar-info-wrap="trimEngineEff"]').hide();
						$('*[data-nTreeCar-info-wrap="trimEleEff"]').hide();
					}



					for(var key in result.info)
					{
						var val = result.info[key];



						if(typeof(val) != 'object')
						{

							var targetArr = $('*[data-nTreeCar-info="'+key+'"]');
							// var targetArr = t.ele.estimateWrap.find('*[data-nTreeCar-info="'+key+'"]');


							if(!val || val == 0 || val == '0' || val == '')
							{
								t.ele.estimateWrap.find('*[data-nTreeCar-info-wrap="'+key+'"]').hide();
							}
							else
							{
								t.ele.estimateWrap.find('*[data-nTreeCar-info-wrap="'+key+'"]').show();
							}


							// 숫자만
							if(key.indexOf('price') >= 0 && parseInt(val) >= 0)
							{
								val = parseInt(val);

								// var org = $('*[data-nTreeCar-info="'+key+'"]').html();
								var org = t.ele.estimateWrap.find('*[data-nTreeCar-info="'+key+'"]').html();

								if(org)
								{
									org = parseInt(org.replace(/,/g, ''));

									if(org)
									{
										(function() {

											var from = org;
											var to = val;

											var rand = 0;
											if(!rand)
											{
												rand = Math.abs((from - to) / 10);
											}

											// var ele = $('*[data-nTreeCar-info="'+key+'"]');
											var ele = t.ele.estimateWrap.find('*[data-nTreeCar-info="'+key+'"]');

											var si = setInterval(function() {

												// var rand = Math.floor(to / 1000);

												// plus
												if(from <= to)
												{
													from += rand;
													if(from >= to)
													{
														from = to;
														ele.html(util.numberFormat(from));
														clearInterval(si);
													}
													ele.html(util.numberFormat(from));
												}
												// minus
												else if(from >= to)
												{
													from -= rand;
													if(from <= to)
													{
														from = to;
														ele.html(util.numberFormat(from));
														clearInterval(si);
													}
													ele.html(util.numberFormat(from));
												}

											}, 50);
										}());
									}
									else
									{
										$('*[data-nTreeCar-info="'+key+'"]').html(util.numberFormat(val));
										// t.ele.estimateWrap.find('*[data-nTreeCar-info="'+key+'"]').html(util.numberFormat(val));
									}
								}
								else
								{
									$('*[data-nTreeCar-info="'+key+'"]').html(util.numberFormat(val));
									// t.ele.estimateWrap.find('*[data-nTreeCar-info="'+key+'"]').html(util.numberFormat(val));
								}

								//
								// console.log($('*[data-nTreeCar-info="'+key+'"]'));
							}
							else
							{


// 								if(key == 'colorExtTitle')
// 								{
// 									var tgtWrap = $('*[data-color-group="ext"]');
// 									var tgtItem = tgtWrap.find('*[data-color-name*="'+val+'"]');
//
// 									if(tgtItem.length > 0)
// 									{
// 										var tgtImgs = tgtItem.find('img');
// 										var modelThumb = tgtImgs[0].getAttribute('src');
// 										$('img[data-ntreecar-info="modelThumb"]').attr('src', modelThumb);
// 									}
// 								}

								$('*[data-nTreeCar-info="'+key+'"]').html(val);

								t.ele.estimateWrap.find('*[data-nTreeCar-info="'+key+'"]').html(val);

								$('input[type="text"][name="input['+key+']"]').val(val);
								$('input[type="hidden"][name="input['+key+']"]').val(val);
								$('input[data-name="'+key+']').val(val);
							}

							if($('*[data-nTreeCar-info="'+key+'"]').length > 0)
							{
								connParam['inputCar['+key+']'] = val;
								// console.log(key, val);
							}

						}
						else if(typeof(val) == 'object' && key.indexOf('index') >= 0)
						{
							var html = '';

							for(var indexKey in val)
							{
								var row = val[indexKey];

								// console.log(row);

								// html += '<button type="button"><span>'+row.title+'</span> <span class="remove" data-nTreeCar-id="'+key+'_'+row.idx+'">X</span></button>';
								html += '<label><span>'+row.title+'</span> <span class="remove" data-nTreeCar-id="'+key+'_'+row.idx+'">X</span></label>';

								if(!connParam['inputCar[idxOptStr]'])
								{
									connParam['inputCar[idxOptStr]'] += '|';
								}
								connParam['inputCar[idxOptStr]'] += row.idx+'|';

								if(connParam['inputCar[option]'])
								{
									connParam['inputCar[option]'] += ',';
								}
								connParam['inputCar[option]'] += row.title;


							}

							// indexKey
							// console.log(key);

							$('*[data-nTreeCar-index="'+key+'"]').html(html);
							$('*[data-nTreeCar-index="'+key+'"]').find('label .remove, button .remove').click(function(event) {

								if(typeof(checkLock) == 'function')
								{
									if(!checkLock(event))
									{
										return false;
									}
								}

								var parent = $(this).parents('label,button');
								var targetId = $(this).attr('data-nTreeCar-id');

								$('*[data-ntreecar-id="'+targetId+'"]').prop('checked', false);
								parent.remove();
							});
						}
						else if(key == 'contract')
						{
							// console.log(val);

							var html = '';

							$('*[data-nTreeCar-info="contract_pricePeriod"]').text(val.pricePeriod);
							html += '계약기간 '+val.pricePeriod+'개월 <br/>';


							$('*[data-nTreeCar-info="contract_kmCode"]').text('-');
							if(val.kmCode)
							{
								$('*[data-nTreeCar-info="contract_kmCode"]').text(val.kmCode);
								connParam['inputCar[kmCode]'] = val.kmCode;
							}


							if(val.userAgeCode == '21over')
							{
								$('*[data-nTreeCar-info="contract_userAge"]').text('21');
								html += '보험연령 만 21세 이상 <br/>';
							}
							else if(val.userAgeCode == '26over')
							{
								$('*[data-nTreeCar-info="contract_userAge"]').text('26');
								html += '보험연령 만 26세 이상 <br/>';
							}
							// html += '주행거리 '+val.pricePeriod+'Km <br/>';
							// console.log(key, val, html);

							// console.log(val.priceDepositCode.substring(val.priceDepositCode.length - 2));

							$('*[data-nTreeCar-info="contract_deposit"]').text('-');
							$('*[data-nTreeCar-info="contract_prepay"]').text('-');

							if(val.priceDepositCode && val.priceDepositCode.indexOf('deposit') >= 0)
							{
								$('*[data-nTreeCar-info="contract_deposit"]').text(val.priceDepositCode.substring(val.priceDepositCode.length - 2)+'%');
								html += '보증금 '+val.priceDepositCode.substring(val.priceDepositCode.length - 2)+'% <br/>';
							}
							else if(val.priceDepositCode && val.priceDepositCode.indexOf('prepay') >= 0)
							{
								$('*[data-nTreeCar-info="contract_prepay"]').text(val.priceDepositCode.substring(val.priceDepositCode.length - 2)+'%');
								html += '선납금 '+val.priceDepositCode.substring(val.priceDepositCode.length - 2)+'% <br/>';
							}
							else
							{
								html += '무보증<br/>';
							}

							if(val.priceDepositP)
							{
								html += '보증금 '+val.priceDepositP+'% <br/>';
							}
							if(val.pricePrepayP)
							{
								html += '선납금 '+val.pricePrepayP+'% <br/>';
							}

							connParam['inputCar[pricePeriod]'] = val.pricePeriod;
							connParam['inputCar[userAgeCode]'] = val.userAgeCode;

							connParam['inputCar[priceDepositP]'] = val.priceDepositP;
							connParam['inputCar[pricePrepayP]'] = val.pricePrepayP;

							$('*[data-nTreeCar-index="'+key+'"]').html(html);
						}
					}
				}

				// console.log(connEle, connTgt, connParam);
				connEle.attr(connTgt, JSON.stringify(connParam));
			}
		});

		// console.log(t, e, formArr);
	}
}





















