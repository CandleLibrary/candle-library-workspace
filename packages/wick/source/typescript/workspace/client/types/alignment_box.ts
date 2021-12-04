// Editor axis aligned bounding boxes in screen space coordinates

export interface AlignmentBox {
    top: number;

    left: number;

    width: number;

    height: number;

    min_x: number;

    min_y: number;

    max_x: number;

    max_y: number;

    angle: number;
}