window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback){window.setTimeout(callback, 1000 / 60);};
    })();


function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
}

function arcPath(x, y, radius, endradius, startAngle, endAngle) {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var start2 = polarToCartesian(x, y, endradius, endAngle);
    var end2 = polarToCartesian(x, y, endradius, startAngle);
    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    var d = [
        "M", start.x, start.y, 
        "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
        "L", end2.x, end2.y,
        "A", endradius, endradius, 0, largeArcFlag, 1, start2.x, start2.y,
        "Z"
    ].join(" ");

    console.log("--------------------------- d", d);

    return d;
}

var spin = {
    slots: [
        {value:'A', color: '#7CB247'},
        {value:'B', color: '#CBDB20'},
        {value:'C', color: '#7CB247'},
        {value:'D', color: '#823572'},
        {value:'E', color: '#7CB247'},
        {value:'F', color: '#CBDB20'},
        {value:'G', color: '#7CB247'},
        {value:'Hegel', color: '#CBDB20'},
        {value:'I', color: '#EC7009'}
    ],
    speed: 10,
    spinSpeed: 10,
    degree: 90,
    obj: null,
    stop: false,
    min_duration: 3000,
    max_duration: 8000,
    rand_speed: 0,
};

var spin_anim = function(){

    console.log("--------------------------- spin.stop", spin.stop);
    console.log("--------------------------- spin", spin);

    if ( spin.stop ) { return true; }

    console.log("--------------------------- spin.stop", spin.stop);


    spin.degree = filter_degree(spin.degree + spin.speed);

    console.log("--------------------------- spin.degree", spin.degree);

    spin.obj.css('transform', 'rotate(' + spin.degree + 'deg)');

    requestAnimFrame(spin_anim);
};


function filter_degree(d) {
    while (d<0){
        d += 360;
    }
    return (d%360);
}

function spin_start() {
    spin.stop = false;
    spin_anim();
    // spin.rand_speed = Math.random();
    spin.rand_speed = 1;
    $( spin ).animate({speed: spin.spinSpeed}, 0.15*spin.min_duration, "easeInBack", function(){
        $( spin ).animate({speed: 0}, (spin.min_duration + (spin.max_duration-spin.min_duration)*spin.rand_speed), "easeOutSine", function(){
            spin_stop();
        });
    });
}

// function spin_stop() {
//     spin.stop = true;
//     var values = spin.obj.css('transform'),
//         values = values.split('(')[1],
//         values = values.split(')')[0],
//         values = values.split(',');
//     var d = filter_degree( Math.atan2(values[1], values[0]) * (180/Math.PI) );
//     var p = (360/spin.slots.length);
//     var slot = Math.floor((360-d) / p);
//     console.log(d + ' => slot #' + slot + ' => ' + spin.slots[slot].value );
//     alert( spin.slots[slot].value );
// }

        function spin_stop(targetSlot) 
        {

            // spin.stop = true;
            var values = spin.obj.css('transform'),
            values = values.split('(')[1],
            values = values.split(')')[0],
            values = values.split(',');

            var d = filter_degree( Math.atan2(values[1], values[0]) * (180/Math.PI) );

            var p = (360/spin.slots.length);
            var slot = Math.floor((360-d) / p);

            // Si le targetSlot est spécifié, ajustez la rotation pour arrêter le slot ciblé
            if (targetSlot !== undefined && targetSlot >= 0 && targetSlot < spin.slots.length) {
            var targetDegree = 360 - (targetSlot * p) - (p / 2);
            var diff = filter_degree(targetDegree - d);
            var rotationDuration = Math.abs(diff / spin.speed) * 1000;

            $(spin).stop(true, false); // Arrête l'animation en cours sans déclencher les callbacks
            spin.degree = d;
            spin.obj.css('transform', 'rotate(' + d + 'deg)');
            // Animation pour ajuster la rotation à la position cible
            spin.obj.animate({rotate: targetDegree}, {
                duration: rotationDuration,
                easing: "easeOutCubic", // Utilisez une courbe d'animation pour un mouvement plus fluide
                step: function(now, fx) {
                    spin.degree = now;
                    spin.obj.css('transform', 'rotate(' + now + 'deg)');
                },
                complete: function() {
                    console.log('Arrêt sur le slot #' + targetSlot + ' => ' + spin.slots[targetSlot].value);
                    // alert(spin.slots[targetSlot].value);
                }
            });
            } else {
            console.log(d + ' => slot #' + slot + ' => ' + spin.slots[slot].value );
            alert(spin.slots[slot].value);
            }
        }


$(document).ready(function(){
    spin.obj = $('#spin');
    
    var slot_count = spin.slots.length;
    var svg = '';
    var t = 0;
    for (var i=0; i<slot_count; i++) {
        t = polarToCartesian(50, 50, 45, ((i+0.5)*(360/slot_count)) );
        svg = svg + '<path d="' + arcPath(50,50, 5, 50, (i*(360/slot_count)), ((i+1)*(360/slot_count))) + '" fill="' + spin.slots[i].color + '" stroke="#ffffff" stroke-width="0" />';
        svg = svg + '<text font-size="6" x="' + t.x + '" y="' + t.y + '" fill="#000000" font-style="bold" font-family="Arial" alignment-baseline="central" text-anchor="middle" transform="rotate(' + (1*((i+0.5)*(360/slot_count))) + ' ' + t.x + ',' + t.y + ')" stroke="#000000" stroke-width="1" opacity="0.3">' + spin.slots[i].value + '</text>';
        svg = svg + '<text font-size="6" x="' + t.x + '" y="' + t.y + '" fill="#ffffff" font-style="bold" font-family="Arial" alignment-baseline="central" text-anchor="middle" transform="rotate(' + (1*((i+0.5)*(360/slot_count))) + ' ' + t.x + ',' + t.y + ')">' + spin.slots[i].value + '</text>';
    }
    $('#spin').html( svg );
    
    spin.degree = Math.random()*360;
    spin.obj.css('transform', 'rotate(' + spin.degree + 'deg)');

    $('#start').click(function(e){
        e.preventDefault();
        spin_start();
    });
    $('#stop').click(function(e){
        e.preventDefault();
        spin_stop();
    });
});