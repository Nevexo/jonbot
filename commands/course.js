// Jonbot - A somewhat-ok management bot
// MIT 2021 - Cameron Fleming

import { MessageActionRow, MessageButton } from "discord.js"

const Courses = [
  {
    "name": "Games Development",
    "value": "GamesDev"
  },
  {
    "name": "Networks & Security",
    "value": "NetSec"
  },
  {
    "name": "Computing",
    "value": "Comp"
  },
  {
    "name": "Computer Science",
    "value": "CompSci"
  },
  {
    "name": "Software Engineering",
    "value": "SoftEng"
  },
  {
    "name": "Cyber Security",
    "value": "CyberSec"
  },
  {
    "name": "Forensic Computing & Security",
    "value": "Forensic"
  }
];

export const Command = {
  "name": "course",
  "description": "Get access to a course's channels and opt-in to notifications",
  "options": [
    {
      "type": 3,
      "required": true,
      "name": "course",
      "description": "The course you're on",
      "choices": Courses
    }
  ]
};

const resolve_course = async (course) => {
  for await (const c of Courses) {
    if (c.value == course) return c;
  }

  return false;
}

export const handle = async (interaction) => {
  let course = interaction.options.getString("course");
  course = await resolve_course(course);

  if (!course) return interaction.reply("Invalid course selected.")

  const row = new MessageActionRow()
    .addComponents(
      new MessageButton()
        .setCustomId("CONFIRM_JOIN_COURSE")
        .setLabel("Yes!")
        .setStyle("PRIMARY"),

      new MessageButton()
        .setCustomId("CANCEL_JOIN_COURSE")
        .setLabel("No")
        .setStyle("DANGER")
    )
  
    await interaction.reply({content: `Confirm you want to join \`${course.name} (${course.value})\` - ` +
    `You'll be able to access the course's channels and you'll get **notifications** relating ` +
    `to your course.`, components: [row]});
}