'use strict';
var Sky = function(two){
    var nIntervId,
    circle,
    group,
    x,
    y,
    nbStar,
    radius,
    aGroup = [];


    for (var i = 0; i < 4; i++){
	    group = {};
	    group.elt = two.makeGroup();
	    group.speed = Math.ceil((i+1)/2);
	    group.xGroup = two.width*(i%2);
			nbStar = Math.round(Math.random()*20)+20;
	    for (var j = 0 ; j < nbStar; j++){
				x = Math.round(Math.random()*two.width);
				y = Math.round(Math.random()*two.height);
				radius = Math.round(Math.random()*20)/10;
	      circle = two.makeCircle(x, y, radius);
	      circle.noStroke().fill = '#FFFFFF';
	      group.elt.add(circle);
	    }
			group.elt.translation.set(group.xGroup, 0);
	    aGroup.push(group);
	  }

		console.log(aGroup[0]);
		console.log(aGroup[1]);
		console.log(aGroup[2]);
		console.log(aGroup[3]);

    two.bind('update', function() {
	    for (var i = 0; i < 4; i++){
				var groupItem = aGroup[i];
				groupItem.xGroup = groupItem.xGroup - groupItem.speed; 
				console.log(i+':'+groupItem.xGroup);
				groupItem.elt.translation.set(groupItem.xGroup, 0);
				if(groupItem.xGroup<-two.width){
					groupItem.xGroup = two.width;
				}
			}
    });
};
