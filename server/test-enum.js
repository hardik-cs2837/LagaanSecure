const {sequelize}=require('./models'); sequelize.query('SELECT typname FROM pg_type WHERE typname LIKE ''%role%''').then(r=>{console.log(r[0]);process.exit()})
