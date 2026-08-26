'use strict';
    
    exports.handler = function(event, context, callback) {
    
      if (event.body) {
        event = JSON.parse(event.body);
      }
    
      var sc; 
      var result = "";
    
      switch(event.option) {
        case "date": 
          switch(event.period) {
            case "yesterday":
              result = setDateResult("yesterday");
              sc = 200;
              break;
            case "today":
              result = setDateResult();
              sc = 200;
              break;
            case "tomorrow":
              result = setDateResult("tomorrow");
              sc = 200;
              break;
            default:
              result = {
                "error": "Must specify 'yesterday', 'today', or 'tomorrow'."
              };
              sc = 400;
              break;
          }
          break;
          default:
            result = {
              "error": "Must specify 'date' or 'time'."
            };
            sc = 400;
          break;
      }
    
      const response = {
        statusCode: sc,
        headers: { "Content-type": "application/json" },
        body: JSON.stringify( result )
      };
    
      callback(null, response);
    
      function setDateResult(option) {
    
        var d = new Date(); // Today
        var mo; // Month
        var da; // Day
        var y; // Year
    
        switch(option) {
          case "yesterday":
            d.setDate(d.getDate() - 1);
            break;
          case "tomorrow":
            d.setDate(d.getDate() + 1);
          default:
           break;
        }
    
        mo = d.getMonth() + 1
        da = d.getDate();
        y = d.getFullYear();
    
        result = {
          "month": mo,
          "day": da,
          "year": y
        };
    
        return result;
      }
    };