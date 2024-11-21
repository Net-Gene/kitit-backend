# Backend Repository for Kit-IT

Tämä arkisto sisältää Kit-IT-projektin taustakoodin. Taustaosa käsittelee kaikki palvelinpuolen logiikka, API-reitit ja tietokantavuorovaikutukset.

---

## Sisällysluettelo
- [Käytetyt tekniikat](#käytetyt-tekniikat)
- [Asennusohjeet](#asennusohjeet)
- [Määritä ympäristömuuttujat](#määritä-ympäristömuuttujat)
- [Käynnistä tietokanta](#käynnistä-tietokanta)
- [API-dokumentaatio](#api-documentation)
- [Substension](#contribution)
- [Kokoonpano](#kokoonpano)
  
---

## Käytetyt tekniikat

- **Node.js / Express**: Palvelinpuolen sovelluksen rakentamiseen.
- **Tietokanta**: MongoDB, MySQL tai PostgreSQL (valitse asennuksesi perusteella).
- **JWT**: Todennusta ja valtuutusta varten.
- **Lisätyökalut**:
  - ESLint: Nukkaamiseen ja koodin laadun ylläpitämiseen.
  - Mocha/Jest: Testaukseen.

---
## Asennusohjeet

### 1. Kloonaa arkisto
```
git-klooni <repository-url>
cd tausta
```

### 2. Asenna riippuvuudet
```
npm asennus
```

## Määritä ympäristömuuttujat
Luo .env-tiedosto juurihakemistoon ja aseta seuraavat muuttujat:

```
DATABASE_URL=<tietokantasi-url>
JWT_SECRET=<salainen-avaimesi>
PORTTI=<oma-portti>
```

## Käynnistä tietokanta
Varmista, että tietokantasi (MongoDB/MySQL/PostgreSQL) on käynnissä.

### Suorita kehityspalvelinmessa seuraava:
```
npm run dev
```

## Kokoonpano
ESLint: Suorita npm run lint tarkistaaksesi koodin tyyli- ja laatuongelmat.
Testaus: Suorita npm-testi suorittaaksesi kaikki yksikkötestit.
Ympäristömuuttujat: Varmista, että .env-tiedosto on määritetty oikein tietokantayhteysmerkkijonoilla ja salaisuuksilla.
