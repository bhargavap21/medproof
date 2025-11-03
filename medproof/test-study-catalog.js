// Test StudyCatalog getStudyById function
const { getStudyById } = require('./backend/src/data/StudyCatalog');

console.log('Testing getStudyById...');
const study = getStudyById('diabetes-metformin-elderly-2024');

console.log('Full study object:');
console.log(JSON.stringify(study, null, 2));

if (study) {
  console.log('\nHas metadata?', !!study.metadata);
  console.log('Has condition?', !!study.metadata?.condition);
  console.log('Has protocol?', !!study.protocol);
} else {
  console.log('Study not found!');
}