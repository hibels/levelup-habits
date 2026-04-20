// babel-preset-expo inlines process.env.NODE_ENV as 'production' during the
// Babel transform phase when the ambient environment has NODE_ENV=production.
// This breaks React's dev bundle (which exports `act`) and causes RNTL to fail.
// Ensure NODE_ENV=test before any modules are loaded so the dev bundle is used.
process.env.NODE_ENV = 'test';
