var Momentmax = global.dbHandel.getModel('momentmax');
// search for max user's max account, if no, create one
Momentmax.find({}, function (err, suc) {
  if (err) throw console.log(err)
  if (!(suc && suc.length)) {
    Momentmax.create({
      account: 1000
    }, function () {
      console.log('finished populating account')
    })
  }
})