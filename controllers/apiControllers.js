const cheerio = require("cheerio");
const axios = require("axios");

const getTierList = async (req, res) => {
  try {
    const html = await axios.get(`https://genshin.gg/tier-list`);
    const $ = cheerio.load(html.data);

    let data = [];
    $(".tier").each(function () {
      const tierTitle = $(this).find(".tier-title").text();
      let characterPerTier = [];

      $(this)
        .find("a")
        .each(function () {
          const name = $(this).find(".character-name").text();
          const role = $(this).find(".character-role").text();
          const constellation = $(this).find(".character-constellation").text();
          const characterType = $(this).find(".character-type").attr("alt");
          const weapon = $(this).find(".character-weapon").attr("alt");

          const imageUrl = $(this).find(".character-icon").attr("src");
          characterPerTier.push({
            name,
            role,
            constellation,
            type: characterType,
            weapon,
            imageUrl,
          });
        });

      data.push({ tierTitle, characterPerTier });
    });

    return res.status(200).send(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send("internal error");
  }
};

const getAllCharacter = async (req, res) => {
  try {
    const html = await axios.get(`https://genshin.gg`);
    const $ = cheerio.load(html.data);

    let data = [];
    $(".character-list").each(function () {
      $(this)
        .find("a")
        .each(function () {
          const name = $(this).find(".character-name").text();
          const type = $(this).find(".character-type").attr("alt");
          const weapon = $(this).find(".character-weapon").attr("alt");
          const imageUrl = $(this).find(".character-icon").attr("src");
          data.push({ name, type, weapon, imageUrl });
        });
    });
    return res.status(200).send(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send("internal error");
  }
};

const getCharacterByName = async (req, res) => {
  try {
    const characterName = req.params.name;
    const html = await axios.get(
      `https://genshin.gg/characters/${characterName}`
    );
    const $ = cheerio.load(html.data);

    if ($(".character").length === 0) {
      res.status(404).send({ code: 404, status: "Data Not Found" });
      return;
    }

    let data = {};

    // get best weapon
    $(".character-build .build-list .build-item").each(function () {
      const description = $(this).find(".build-description").text();
      const weaponList = [];
      const artifactList = [];
      $(this)
        .find(".build-weapon-list")
        .children()
        .each(function () {
          const name = $(this)
            .find(
              ".build-weapon-wrapper .build-weapon .build-weapon-header .build-weapon-name"
            )
            .text();
          const stats = $(this)
            .find(
              ".build-weapon-wrapper .build-weapon .build-weapon-header .build-weapon-stat"
            )
            .text();
          const rarity = $(this)
            .find(".build-weapon-wrapper .build-weapon .build-weapon-rarity")
            .children().length;
          const weaponDescription = $(this)
            .find(
              ".build-weapon-wrapper .build-weapon .build-weapon-info .build-weapon-bonus"
            )
            .text();
          const iconUrl = $(this)
            .find(
              ".build-weapon-wrapper .build-weapon .build-weapon-meta .build-weapon-icon"
            )
            .attr("src");
          weaponList.push({
            name,
            stats,
            rarity,
            description: weaponDescription,
            iconUrl,
          });
        });

      $(this)
        .find(".build-artifact-list")
        .children()
        .each(function (i, element) {
          // loop through artifact
          $(this)
            .find(".build-artifact-wrapper .build-artifact")
            .each(function () {
              const iconUrl = $(this)
                .find(".build-artifact-meta .build-artifact-icon")
                .attr("src");
              const name = $(this)
                .find(".build-artifact-header .build-artifact-name")
                .text();
              const status = $(this)
                .find(".build-artifact-header .build-stat")
                .text();
              // const description = $(this).find(".build-artifact-bonus").
              let description = [];
              $(this)
                .find(".build-artifact-bonus")
                .each(function (i, link) {
                  const test = $(this).text();
                  description.push(test);
                });

              artifactList.push({ name, status, description, iconUrl });
            });
        });

      data = { description, weaponList, artifactList };
    });

    // get character profile
    $(".character-header .character-meta").each(function () {
      const rarity = $(this).find(".character-rarity").children().length;
      const name = $(this).find(".character-icon").attr("alt");
      const imageUrl = $(this).find(".character-icon").attr("src");
      const type = $(this).find(".character-type").attr("alt");
      const weapon = $(this).find(".character-weapon").attr("alt");

      data = { rarity, name, imageUrl, weapon, type, ...data };
    });

    // get best companion
    let bestTeams = [];
    $(".character-teams .teams-list")
      .children()
      .each(function () {
        let eachTeam = [];
        $(this)
          .find(".teams-item .character-list")
          .children()
          .each(function () {
            const name = $(this)
              .find(".character-portrait .character-name")
              .text();
            const icon = $(this)
              .find(".character-portrait .character-icon")
              .attr("src");
            const type = $(this)
              .find(".character-portrait .character-type")
              .attr("alt");
            const weapon = $(this)
              .find(".character-portrait .character-weapon")
              .attr("alt");
            eachTeam.push({ name, icon, type, weapon });
          });
        bestTeams.push(eachTeam);
      });

    // get active skill
    let skillList = [];
    $(".character-talents .character-skills .character-skills-list")
      .children()
      .each(function () {
        const skillName = $(this).find(".skills-header .skills-name").text();
        const skillType = $(this).find(".skills-header .skills-unlock").text();
        const skillDescription = $(this).find(".skills-description").html();
        const iconSkill = $(this).find(".skills-meta .skills-icon").attr("src");
        skillList.push({
          name: skillName,
          icon: iconSkill,
          type: skillType,
          description: skillDescription,
        });
      });

    let passiveSkill = [];
    $(".character-passives .passives-list")
      .children()
      .each(function () {
        const passiveName = $(this)
          .find(".passives-meta .passives-name")
          .text();
        const passiveUnlock = $(this)
          .find(".passives-meta .passives-unlock")
          .text();
        const passiveDescription = $(this).find(".passives-description").html();
        const passiveIcon = $(this)
          .find(".passives-meta .passives-icon")
          .attr("src");
        passiveSkill.push({
          name: passiveName,
          unlock: passiveUnlock,
          description: passiveDescription,
          icon: passiveIcon,
        });
      });
    data = { ...data, bestTeams, skillList, passiveSkill };

    return res.status(200).send(data);
  } catch (error) {
    console.log(error);
    return res.status(500).send("internal error");
  }
};
module.exports = { getTierList, getAllCharacter, getCharacterByName };
