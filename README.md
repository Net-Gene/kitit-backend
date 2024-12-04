# Backend Repository for Kit-IT

Tämä arkisto sisältää Kit-IT-projektin taustakoodin. Taustaosa käsittelee palvelinpuolen logiikkaa, API-reittejä ja tietokantavuorovaikutuksia.

---

## Sisällysluettelo
- [Käytetyt tekniikat](#käytetyt-tekniikat)
- [Asennusohjeet](#asennusohjeet)
- [Määritä ympäristömuuttujat](#määritä-ympäristömuuttujat)
- [Käynnistä tietokanta](#käynnistä-tietokanta)
- [API-reitit](#api-reitit)
- [Projektin rakenne](#projektin-rakenne)
- [Käynnistys](#käynnistys)
- [Testaus](#testaus)
- [Kokoonpano](#kokoonpano)

---

## Käytetyt tekniikat

- **Node.js / Express**: Palvelinpuolen sovelluksen rakentamiseen.
- **PostgreSQL**: Tietokanta sovellukselle.
- **JWT (JSON Web Token)**: Käyttäjien todennukseen ja valtuutukseen.
- **dotenv**: Ympäristömuuttujien hallintaan.
- **cookie-parser**: Evästeiden käsittelyyn.
- **cors**: Suojattujen yhteyksien sallimiseen.
- **Jest**: Testaustyökalu.

---

## Asennusohjeet

### 1. Kloonaa arkisto
```bash
git clone <repository-url>
cd main
```

### 2. Asenna riippuvuudet
```bash
npm install
```

## Määritä ympäristömuuttujat
Luo .env-tiedosto juurihakemistoon ja aseta seuraavat muuttujat:

```makefile
DATABASE_URL=<tietokantasi-url>
JWT_SECRET=<salainen-avaimesi>
PORTTI=<oma-portti>
```

## Käynnistä tietokanta
Varmista, että PostgreSQL-palvelu on käynnissä ja ympäristömuuttujat on asetettu oikein tietokantayhteyttä varten.

# Backend Repository for Kit-IT

Tämä arkisto sisältää Kit-IT-projektin taustakoodin, joka käsittelee palvelinpuolen logiikkaa, API-reittejä ja tietokantavuorovaikutuksia.

---

## API-reitit

Tausta tarjoaa seuraavat API-reitit:

### Todennusreitit (/api/auth)
- **POST /login**: Kirjautuminen käyttäjänä.
- **POST /register**: Uuden käyttäjän rekisteröinti.
- **POST /clearCookie**: Kirjautumisen uloskirjautuminen ja evästeiden tyhjennys.

**Erityistiedot JWT-asetuksista:**
- Evästeet vanhenevat tunnin sisällä.
- Evästeiden tyhjennykselle on oma reitti, jota frontend käyttää käyttäjän poistaessa tilinsä tai kirjautuessa ulos.

### Käyttäjäreitit (/api/user)
- Käyttäjäprofiilin ja -tietojen hallintaan liittyvät reitit.

### Tuotereitit (/api/products)
- Tuotteiden hakemiseen ja hallintaan liittyvät reitit.

### Ajanvarausreitit (/api/appointments)
- Ajanvarausten hallintaan.
  - **Validointisäännöt**: Ajanvarauksia ei voi tehdä ajalle, joka on jo varattu.

---

## Projektin rakenne

Projektin kansiorakenne on seuraava:

```bash
main/
├── .github/workflows/npm-publish.yml
├── config/db.js             # Tietokantayhteyden määrittely
├── controllers/             # Reittien ohjaimet
├── middlewares/             # Välimääritykset (esim. token-tarkastus)
├── models/                  # Tietokantamallit
├── routes/                  # Sovelluksen reitit
├── services/                # Liiketoimintalogiikka
├── index.js                 # Sovelluksen pääpiste
├── index.test.js            # Testitiedosto
├── jest.config.js           # Jestin määritykset
├── .eslintrc.json           # ESLint-määritykset
├── package.json             # Projektin riippuvuudet ja skriptit
└── package-lock.json        # Tarkka riippuvuuksien hallinta
```
---

## Käynnistys

Suorita käynnistys komennolla:

```bash
npm start
```

---

## Testaus

Suorita yksikkötestit komennolla:

```bash
npm test
```

Testauksen tila:

Testaus kattaa backend-järjestelmän pintatoiminnot.
Syvällisempi testaus ei ole tällä hetkellä toteutettu.

---

## Kokoonpano

### ESLint

Voit tarkistaa koodin tyyli- ja laatuongelmat seuraavasti:

```bash
npm run lint
```

### CI/CD

GitHub Actions on määritetty julkaisemaan npm-paketit automaattisesti pull request -tapahtumissa. Muista päivittää package.json ennen PR:n lähettämistä.