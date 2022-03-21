#!/usr/bin/env node

// Node 开发命令行  必须使用shebang 声明

const program = require('commander');
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const chalk = require('chalk')
const packageData = require('./package.json')
const fs = require('fs')
const path = require('path')
const { DH_CHECK_P_NOT_SAFE_PRIME } = require('constants')


// templates 以后可以继续拓展
const templates = {
  'vue3+ts': {
    url: 'https://github.com/CFCode-git/first-cli-vue3',
    downloadUrl: 'https://github.com:CFCode-git/first-cli-vue3#main',
    description: '使用vue-cli创建',
  },
  'vue3+vite+ts': {
    url: 'https://github.com/CFCode-git/first-cli-vue3-vite',
    downloadUrl: 'https://github.com:CFCode-git/first-cli-vue3-vite#main',
    description: '使用vite创建',
  },
  'react+ts': {
    url: 'https://github.com/CFCode-git/first-cli-react',
    downloadUrl: 'https://github.com:CFCode-git/first-cli-react#main',
    description: '使用create-react-app创建',
  },
}

program
  .version(packageData.version)
  .option("-I,--init", "项目初始化")
  .option("-L,--list", "模板列表")

program.parse(process.argv)


if (program.opts() && program.opts().list) {
  // 打印当前模板 KeyName 以及 description
  for (let key in templates) {
    console.log(`- ${key}:${templates[key].description}`)
  }
}

if (program.opts() && program.opts().init) {
  inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: '请输入项目名称',
    },
    {
      type: 'input',
      name: 'decription',
      message: '请输入项目介绍',
    },
    {
      type: 'input',
      name: 'author',
      message: '请输入开发者名称',
    },
    {
      type: 'list',
      name: 'template',
      choices: [
        "vue3+TS (vue3 + ts项目模板)",
        "vue3+vite+TS (vue3 + ts项目模板)",
        "react+TS (react + ts项目模板)"
      ]
    }
  ])
    .then(customElements => {
      const templatesKey = customElements.templates.split(" ")[0]
      console.log('选择模板：' + templatesKey)
      const downloadUrl = templates[templatesKey].downloadUrl
      initTemplateDefault(customElements, downloadUrl)
    })
}

async function initTemplateDefault(customElements, downloadUrl) {
  console.log(
    chalk.bold.cyan('tinyCli' + 'will create a new project')
  )
  const { projectName = '' } = customElements


  try {
    await checkProjectName(projectName)  // 检查文件是否已存在
    await downloadTemplate(downloadUrl, projectName)  // 下载项目模板
    await changeTemplate(customMessage)  // 更改 package.json 信息
    console.log(chalk.green("template download completed"))
    console.log(
      chalk.bold.cyan("firstCli: ") + "a new project is created, enjoy~"
    )
  } catch (error) {
    console.log(chalk.red(error))
  }
}

function checkProjectName(name) {
  return new Promise((resolve, reject) => {
    const projectPath = process.cwd()
    fs.readdir(projectPath, (error, data) => {
      if (error) {
        reject(error)
      }
      if (data.includes(name)) {
        return reject(new Error(`${name} is already exists!`))
      }
      resolve()
    })
  })
}

function downloadTemplate(downloadUrl, projectName) {
  const spinner = ora('template downloading, please hold on ...').start()
  return new Promise((resolve, reject) => {
    const projectPath = path.resolve(process.cwd(), projectName)
    download(
      downloadUrl,
      projectPath,
      { clone: true },
      function (error) {
        if (error) {
          return reject(error)
          spinner.fail()
        }
        spinner.succeed()
        resolve()
      }
    )
  })
}

async function changeTemplate(customMessage) {
  const { projectName = '', description = '', author = '' } = customMessage
  return new Promise((resolve, reject) => {
    const packageJsonPath = path.resolve(process.cwd(), projectName, 'package.json')
    // console.log(path.resolve(process.cwd(), projectName, 'package.json'))
    fs.readFile(
      packageJsonPath,
      'utf8',
      (error, data) => {
        if (error) {
          return reject(error)
        }
        const packageContent = JSON.parse(data)
        packageContent.name = projectName
        packageContent.author = author
        packageContent.description = description
        fs.writeFile(
          packageJsonPath,
          JSON.stringify(packageContent, null, 2),
          'utf8',
          (error, data) => {
            if (error) {
              return reject(error)
            }
            resolve()
          }
        )
      }
    )
  })
}
