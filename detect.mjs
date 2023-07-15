export const side = (origin, user_theta, w) => {
    const x1 = origin[0] + w*Math.round(Math.cos(degToRad(user_theta)));
    const y1 = origin[1] + w*Math.round(Math.sin(degToRad(user_theta)));
    const x2 = origin[0] - w*Math.round(Math.cos(degToRad(user_theta)));
    const y2 = origin[1] - w*Math.round(Math.sin(degToRad(user_theta)));
    const origin_a1 = [x1,y1];
    const origin_a2 = [x2,y2];
    const origin_a = [origin_a1,origin_a2];
    return origin_a;
}

export const shift = (origin, user_theta, h) => {
    const x1 = origin[0] + h*Math.round(Math.cos(degToRad(90-user_theta)));
    const y1 = origin[1] + h*Math.round(Math.sin(degToRad(90-user_theta)));
    const origin_a = [x1,y1];
    return origin_a;
}

export const degToRad = (deg) => {
    return deg * (Math.PI/180);
}

export const extractLocations = (locations, points) => {
    return locations.filter(location => countIntersections(location.slice(0,2), points))
}

export const countIntersections = (origin, points) => {
    let count = 0;
    for (let i = 0; i < 4; i++) {
        const pt1 = points[i];
        const pt2 = points[i - 1 < 0 ? points.length - 1 : i - 1];
        if (isIntersecting(origin, pt1, pt2)) {
            count += 1;
        }
    }
    return count % 2 === 1;
}

export const isIntersecting = (origin, pt1, pt2) => {
    const [x1, y1] = pt1;
    const [x2, y2] = pt2;
    const [x, y] = origin;
    if (x1 - x2 === 0) {
        return (y1 < y && y < y2  ||  y2 < y && y < y1) && x < x1;
    } else if (y1 - y2 === 0) {
        return false;
    } else {
        const A = (y1 - y2) / (x1 - x2);
        const B = y1 - A * x1;
        const X = (y - B) / A;
        const isYInRange = y1 < y && y < y2  ||  y2 < y && y < y1;
        const isXInRange = (x1 < X && X < x2  ||  x2 < X && X < x1)  &&  x < X;
        return isXInRange && isYInRange;
    }
}

/*
points1 = side(user_loc,user_theta,w)
points2 = shift(user_loc,user_theta,h)
points3 = side(points2,user_theta,w)
points =(points1[0],points1[1],points3[1],points3[0])
*/

export const calcBoundingBox = (userPosition, angle, w, h) => {
    const points1 = side(userPosition, angle, w);
    const points2 = shift(userPosition, angle, h);
    const points3 = side(points2, angle, w);
    return [points1[0], points1[1], points3[1], points3[0]];
}

export const findDangerLocationsWithinRange = (userPos, angle, w, h, dangerLocations) => {
    const boundingBox = calcBoundingBox(userPos, angle, w, h);
    return extractLocations(dangerLocations, boundingBox);
}

const userPosition = [3,3]
const angle = 210
const w = 1
const h = 2.5
const dangerLocations = [[1,3,"break"],[2,3,"break"],[3,1,"break"],[4,2,"break"],[5,3,"break"],[4,4,"break"],[3,5,"break"],[2,4,"break"]];
const points = calcBoundingBox(userPosition, angle, w, h);

const extracted = extractLocations(dangerLocations, points);

console.log(points);
console.log(extracted);