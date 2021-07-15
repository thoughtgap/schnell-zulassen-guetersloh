const request = require('request');
const fs = require('fs');
const moment = require('moment');
const { exit } = require('process');

const urlPrefix = "https://netappoint.de/ot/kreis-gt/index.php?company=kreis-gt&cur_cause=0";
const monateTxt = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

let wunschTermine = [
      { von: '2021-06-24 06:00', bis: '2021-06-24 08:30'}
    , { von: '2021-06-25 06:00', bis: '2021-06-25 17:00'}
    , { von: '2021-06-28 06:00', bis: '2021-06-28 09:00'}
    , { von: '2021-06-29 06:00', bis: '2021-06-28 09:30'}
    , { von: '2021-07-01 13:00', bis: '2021-06-28 19:30'}
];

// Wunschtermine parsen und sortieren
wunschTermine.forEach(termin => {
    termin.von = moment(termin.von, 'YYYY-MM-DD HH:mm');
    termin.bis = moment(termin.bis, 'YYYY-MM-DD HH:mm');
});
wunschTermine = wunschTermine.sort((a, b) => (b.von.isBefore(a.von)) ? 1 : -1);

const getUrl = (step = 2, year, month, day = null) =>  {
    let url = `${urlPrefix}&step=${step}&month=${month}&year=${year}`;
    if(day !== null) {
        url += `&day=${day}`;
    }
    return url;
};

urlToday = getUrl(2,moment().year(),moment().month());
request(urlToday, {}, (err, res, body) => {
    if (err) {
        return console.log(err);
    }
    
    const regexFreieTage = /<span class="hidden">Termine am <\/span>(\d{2}) <span class="hidden">\. (.*) (\d{4})<\/span>/g;
    freieTage = [...res.body.matchAll(regexFreieTage)];
    freieTageDatum = [];

    freieTage.forEach(tagMatch => {
        freieTageDatum.push({
            tag: parseInt(tagMatch[1]),
            monatTxt: tagMatch[2],
            monat: ( monateTxt.indexOf(tagMatch[2]) + 1),
            jahr: parseInt(tagMatch[3])
        });
    });

    console.log(`${freieTageDatum.length} freie Termine gefunden`);
    console.log(`Erster freier Termin am ${freieTageDatum[0].tag}. ${freieTageDatum[0].monatTxt} ${freieTageDatum[0].jahr}`);

    ersterTerminMoment = moment(`${freieTageDatum[0].jahr}-${freieTageDatum[0].monat}-${freieTageDatum[0].tag}`, 'YYYY-MM-DD');

    if(ersterTerminMoment <= wunschTermine[wunschTermine.length - 1].von) {

        // Dies hier sind die Termine am erstmöglichen Tag
        checkDay(freieTageDatum[0].jahr,freieTageDatum[0].monat,freieTageDatum[0].tag);

        // Alle Wunschtermintage durchgehen
        let letzterPruefTag = null;
        wunschTermine.forEach(wunschtermin => {
            if(letzterPruefTag != wunschtermin.von.format("YYYY-MM-DD")) {
                letzterPruefTag = wunschtermin.von.format("YYYY-MM-DD");
                
                checkDay(wunschtermin.von.format('YYYY'),wunschtermin.von.format('M'),wunschtermin.von.format('D'));
            }
        });
    }
    else {
        console.log("Erster freier Termin liegt nach allen Wunschterminen. Abbruch.");
    }  
});

const checkDay = (year,month,day) => {
    console.log(`Prüfe Tag ${day}.${month}.${year}`);
    
    request(getUrl(3,year,month,day), {}, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
    
        allContent = res.body.replace(/\t/g,'');
        freieTermine = [...allContent.matchAll(/Termin um (\d{2}:\d{2}) Uhr/g)];
        freieTermine.forEach(terminMatch => {
            momentObj = moment(`${year}-${month}-${day} ${terminMatch[1]}`, 'YYYY-MM-DD HH:mm');

            let wunschTermin = isWunschTermin(momentObj);
            
            summary = (`${wunschTermin ? 'Wunscht' : '      T'}ermin verfügbar: ${momentObj.format('ddd DD. MMM YYYY HH:mm')}`);
            console.log(summary + "  " + getUrl(3,year,month,day));
            
            if(wunschTermin) {
                telegramAlert("KFZ-Zulassung in GT\n"+summary + " " + getUrl(3,year,month,day));
            }
        });
    });
}

const isWunschTermin = (momentTermin) => {
    output = false;
    wunschTermine.forEach(wTermin => {
        if(momentTermin >= wTermin.von && momentTermin <= wTermin.bis) {
            output = true;
        }
    });
    return output;
}

const telegramAlert = (message) => {
    request("https://api.telegram.org/XXXXXX/sendMessage?chat_id=XXXXXXX&text="+encodeURIComponent(message), {}, (err, res, body) => {});
}