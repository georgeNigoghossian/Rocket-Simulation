# Rocket Simulator Using Three.js

## Idea Of The Project 

 Simulating the launch of a rocket using three.js based on physical and mathematical calculations.
 The user has the ability to change the characteristics of the rocket (cylinder height , initial mass , payload mass , fuel mass , fuel loss , exhaust speed , exhaust area , exhaust pressure , angle of rotation , shape of the rocket head) and the characteristics of the planet  (mass of world , world radius , temperature ) considering all of the previously mentioned characteristics affect directly the forces that are applied on the rocket (lift , weight , drag , thrust).
 The screen also shows live data while the rocket is flying like the position of the rocket , the maximum height it reaches , total mass (rocket mass + payload mass + fuel mass ) , fuel mass , velocity , drag coefficient . 

## Setup
Download [Node.js](https://nodejs.org/en/download/).
Run this followed commands:

``` bash
# Install dependencies (only the first time)
npm install

# Run the local server at localhost:8080
npm run dev

# Build for production in the dist/ directory
npm run build
```
## Run
After running the project press "f" to make rocket fly .
You can shift between "1" and "2" keys to change the view perspective . 

## Contributors 
- @bshralhomsi
- @FassehAlzaher
- @OmarAlloushGit