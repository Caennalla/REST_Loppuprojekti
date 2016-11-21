-- Luodaan tietokanta ja otetaan se käyttöön
CREATE DATABASE GadgetDatabase;
USE GadgetDatabase;

-- Luodaan käyttäjätunnustaulu
CREATE TABLE IF NOT EXISTS `gadgets` (
  `ID` int(12) NOT NULL AUTO_INCREMENT,
  `Name` varchar(20) NOT NULL,
  `Description` varchar(30) NOT NULL,
  `Latidute` float(20) NOT NULL,
  `Longidute` float(25) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Lisätään testihenkilöt
INSERT INTO gadgets (Name, Description, Latidute, Longidute) VALUES ('Puhelin', 'Vanha', '100.123', '123.321');

INSERT INTO gadgets (Name, Description, Latidute, Longidute) VALUES ('Jakoavain', 'Availuhommiin', '100.321', '132.231');