import { CSS_Transform3D, CSS_Transform2D } from "../../build/types/transform.js";

const transform = new CSS_Transform3D();

assert("Base transform equals identity matrix", transform.toString() == "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)");

transform.px = 50;
transform.py = 100;

assert("Translation is correct place", transform.toString() == "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,50,100,0,1)");

transform.px = 50;
transform.py = 100;

transform.rz = Math.PI * 1;

assert("180 degree rotation about Z axis", transform.toString() == "matrix3d(-1,0,0,0,0,-1,0,0,0,0,1,0,50,100,0,1)");

assert("CSS_Transform2D automatically converts to CSS_Transform3D from string", (new CSS_Transform2D("translateZ(50)").toString()) == "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,50,1)");

//assert("CSS_Transform2D automatically converts to CSS_Transform3D from string", (new CSS_Transform2D("rotateY(90deg)").toString()) == "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,50,1)");