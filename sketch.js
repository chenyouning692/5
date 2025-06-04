let video;
let handpose;
let predictions = [];

let circles = [];
let score = 0;
let targetScore = 6;
let box;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // 確保 ml5.handpose 方法正確使用
  if (ml5 && ml5.handpose) {
    handpose = ml5.handpose(video, () => {
      console.log("Handpose ready!");
    });

    handpose.on("predict", results => predictions = results);
  } else {
    console.error("ml5.handpose is not available. Please check your ml5.js version or CDN link.");
  }

  // 初始化圈
  for (let i = 0; i < targetScore; i++) {
    let overlapping;
    let newCircle;
    do {
      overlapping = false;
      newCircle = {
        x: random(50, width - 50),
        y: random(50, height - 50),
        r: 30,
        inBox: false
      };

      for (let circle of circles) {
        if (dist(newCircle.x, newCircle.y, circle.x, circle.y) < newCircle.r * 2) {
          overlapping = true;
          break;
        }
      }
    } while (overlapping);

    circles.push(newCircle);
  }

  box = {
    x: width - 160,
    y: height - 160,
    w: 140,
    h: 140
  };
}

function draw() {
  image(video, 0, 0, width, height);

  // Draw target box
  noFill();
  stroke(255);
  strokeWeight(3);
  rect(box.x, box.y, box.w, box.h);

  // Draw and check circles
  fill(139, 69, 19); // brown
  noStroke();

  score = 0;
  for (let circle of circles) {
    if (circle.inBox) {
      fill(255, 215, 0); // gold if already in box
    } else {
      fill(139, 69, 19);
    }

    ellipse(circle.x, circle.y, circle.r * 2);

    if (
      circle.x > box.x &&
      circle.x < box.x + box.w &&
      circle.y > box.y &&
      circle.y < box.y + box.h
    ) {
      circle.inBox = true;
    }

    if (circle.inBox) score++;
  }

  // Draw score
  fill(255);
  textSize(24);
  textAlign(RIGHT, TOP);
  text(`${score}/${targetScore}`, width - 10, 10);

  // Draw hand keypoints and check if fingers touch circles
  if (predictions.length > 0) {
    let keypoints = predictions[0].landmarks;

    for (let pt of keypoints) {
      fill(0, 255, 255);
      noStroke();
      circle(pt[0], pt[1], 10);

      // Check collision with any circle
      for (let circle of circles) {
        let d = dist(pt[0], pt[1], circle.x, circle.y);
        if (d < circle.r && !circle.inBox) {
          circle.x = lerp(circle.x, pt[0], 0.2);
          circle.y = lerp(circle.y, pt[1], 0.2);
        }
      }
    }
  }

  // Show win message
  if (score === targetScore) {
    fill(0, 255, 0);
    textSize(32);
    textAlign(CENTER, CENTER);
    text("You Win!", width / 2, height / 2);
  }
}
