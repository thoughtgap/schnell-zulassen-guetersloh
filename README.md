# schnell-zulassen-guetersloh

Termine bei der Kfz-Zulassungsstelle in Gütersloh gibt es oftmals erst in einigen Wochen. Laufend werden jedoch kurzfristig Termine frei. Dieses Skript übernimmt das Prüfen auf freie Termine und sendet eine Benachrichtigung.
Es können Wunsch-Zeiträume angegeben werden, in denen dann nach freien Terminen gesucht wird.

Die Benachrichtigung erfolgt per Telegram-Bot.

Die Buchung des Termins muss dann manuell erfolgen.

## Ausführen
Via `node index.js`

## Wunschtermine angeben
In der `index.js` die Variable `wunschTermine` befüllen:

```javascript
let wunschTermine = [
      { von: '2021-06-24 06:00', bis: '2021-06-24 08:30'}
    , { von: '2021-06-25 06:00', bis: '2021-06-25 17:00'}
    , { von: '2021-06-28 06:00', bis: '2021-06-28 09:00'}
    , { von: '2021-06-29 06:00', bis: '2021-06-28 09:30'}
    , { von: '2021-07-01 13:00', bis: '2021-06-28 19:30'}
];
```
