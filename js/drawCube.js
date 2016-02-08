$(document).ready(function(){
    var colorMap = ['rgb(0,255,0)', 'rgb(255,255,0)', 'rgb(255,0,0)', 'rgb(0,0,0)', 'rgb(0,255,255)', 'rgb(255,255,255)', 'rgb(255,0,255)', 'rgb(0,0,255)'];
    var ADJ_MAX = 1;
    var ADJ_MIN = -1;
    var ORI_MAX = 255;
    var ORI_MIN = 0;
    var FPS = 40;

    function Point3D(x,y,z) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.rotateX = function(angle) {
            var rad, cosa, sina, y, z
            rad = angle * Math.PI / 180
            cosa = Math.cos(rad)
            sina = Math.sin(rad)
            y = this.y * cosa - this.z * sina
            z = this.y * sina + this.z * cosa
            return new Point3D(this.x, y, z)
        }

        this.rotateY = function(angle) {
            var rad, cosa, sina, x, z
            rad = angle * Math.PI / 180
            cosa = Math.cos(rad)
            sina = Math.sin(rad)
            z = this.z * cosa - this.x * sina
            x = this.z * sina + this.x * cosa
            return new Point3D(x,this.y, z)
        }

        this.rotateZ = function(angle) {
            var rad, cosa, sina, x, y
            rad = angle * Math.PI / 180
            cosa = Math.cos(rad)
            sina = Math.sin(rad)
            x = this.x * cosa - this.y * sina
            y = this.x * sina + this.y * cosa
            return new Point3D(x, y, this.z)
        }

        this.project = function(viewWidth, viewHeight, fov, viewDistance) {
            var factor, x, y
            factor = fov / (viewDistance + this.z)
            x = this.x * factor + viewWidth / 2
            y = this.y * factor + viewHeight / 2
            return new Point3D(x, y, this.z)
        }
    }

    function createColorPoint() {
        var oriClrs = [];
        var newClrs = [];
        oriClrs.push($('input.red').val() || '0');
        oriClrs.push($('input.green').val() || '0');
        oriClrs.push($('input.blue').val() || '0');
        oriClrs.forEach(function(clr) {
            if (clr.match(/[^\d]/) || clr < 0 || clr > 255) {
                clr = 0;
            }
            newClrs.push(clr);
        });
        if ($('input.red').val() && newClrs[0] != $('input.red').val()) {
            $('input.red').val(newClrs[0]);
        }
        if ($('input.green').val() && newClrs[1] != $('input.green').val()) {
            $('input.green').val(newClrs[1]);
        }
        if ($('input.blue').val() && newClrs[2] != $('input.blue').val()) {
            $('input.blue').val(newClrs[2])
        }
        var redAdj = ((ADJ_MAX - ADJ_MIN) * (oriClrs[0] - ORI_MIN))/(ORI_MAX - ORI_MIN) + ADJ_MIN;
        var greAdj = ((ADJ_MAX - ADJ_MIN) * (oriClrs[1] - ORI_MIN))/(ORI_MAX - ORI_MIN) + ADJ_MIN;
        var bluAdj = ((ADJ_MAX - ADJ_MIN) * (oriClrs[2] - ORI_MIN))/(ORI_MAX - ORI_MIN) + ADJ_MIN;

        var colPt = new Point3D(redAdj,greAdj,bluAdj);
        var colRt = colPt.rotateX(angle).rotateY(angle);
        var colProj = colRt.project(500,500,500,4);
        var fillColor = 'rgb('+oriClrs[0]+','+oriClrs[1]+','+oriClrs[2]+')';
        $('.colorSquare').css('background-color', fillColor);
        ctx.fillStyle = fillColor;
        ctx.strokeStyle="#000";
        ctx.beginPath();
        ctx.arc(colProj.x,colProj.y,7,0,2*Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    var vertices = [
        new Point3D(-1,1,-1),
        new Point3D(1,1,-1),
        new Point3D(1,-1,-1),
        new Point3D(-1,-1,-1),
        new Point3D(-1,1,1),
        new Point3D(1,1,1),
        new Point3D(1,-1,1),
        new Point3D(-1,-1,1)
    ];

    var faces  = [[0,1,2,3],[1,5,6,2],[5,4,7,6],[4,0,3,7],[0,4,5,1],[3,2,6,7]];

    var angle = 0;

    function loop() {
        setTimeout(function() {
            requestAnimationFrame(loop);
            var t = new Array();

            ctx.fillStyle = "rgb(255,255,255)";
            ctx.fillRect(0,0,500,500);

            vertices.forEach(function(vert, i) {
                var v = vertices[i];
                var r = v.rotateX(angle).rotateY(angle);
                var p = r.project(500,500,500,4);
                t.push(p)
            });

            var avg_z = new Array();

            faces.forEach(function(face, i) {
                var f = faces[i];
                avg_z[i] = {"index":i, "z":(t[f[0]].z + t[f[1]].z + t[f[2]].z + t[f[3]].z) / 4.0};
            });

            avg_z.sort(function(a,b) {
                return b.z - a.z;
            });

               faces.forEach(function(face, i){
                var f = faces[avg_z[i].index];
                ctx.fillStyle = 'rgba(0,0,0,0.025)';
                ctx.strokeStyle="#908F8F";
                ctx.beginPath();
                ctx.moveTo(t[f[0]].x,t[f[0]].y);
                ctx.lineTo(t[f[1]].x,t[f[1]].y);
                ctx.lineTo(t[f[2]].x,t[f[2]].y);
                ctx.lineTo(t[f[3]].x,t[f[3]].y);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
               });

            t.forEach(function(vert, idx) {
                ctx.fillStyle = colorMap[idx];
                ctx.strokeStyle="#000";
                ctx.beginPath();
                ctx.arc(vert.x,vert.y,7,0,2*Math.PI);
                ctx.fill();
                ctx.stroke();
            });

            createColorPoint();

            angle += 2;
        }, 1000 / FPS);
    }

    // Start animation
    canvas = $('.myCanvas');
    if( canvas.get(0) && canvas.get(0).getContext ) {
        ctx = canvas.get(0).getContext("2d");
        loop();
    }
});
