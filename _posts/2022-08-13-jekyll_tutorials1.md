---
layout: post
title: 免域名免云主机简单快速搭建Github个人博客
date: 2022-08-12
tags: jekyll主题+ Github
---

###Github创建jekyll网页
      
      1、注册GitHub账户，选免费的项目即可，不懂英文的可网页翻译，账户名不能带中文，邮箱注册。

      2、登录Github新建一个Repositories，命名称格式最好为：你的用户名.github.io

      3、库界面选择Settings，GitHub pages选择你需要开通网页功能Save
    
      4、在地址栏输入：用户名.http://github.io你就可以访问页面了

      5、win10系统安装GithubDesktop下载Code (你的“用户名.github.io”网站的全部文件）
           linux/mac 系统安装Git拉取你网站的Code


### 自定义主题创作文章
     上网搜Jekyll主题下载到本地，参考Jekyllm主题目录，编辑about.md、support.md 等为自定义页面
 
     如果你想添页面可直接复制about.md 文件修改文件名和里面的内容即可。

     如果需要在导航显示你新增的页面，直接在`_config.yml` 文件的nav字段中添加你新页面配置即可

     如果要修改博客模板信息建议只修改`_config.yml` 文件内容，博客文章在`_posts` 。

###安装Jekyll检验修改好的博客网站（有点复杂,经常报错）

      参考Jekyll官网安装，报错按提示出入命令安装缺少的文件bundle add "提示缺的文件"
       
      bundle install

      bundle exec jekyll serve
     
      点http://localhost:4000就可以看到网站效果

###上传改好的网站
    
      本地上传：GithubDesktop或者Git


###Github加速登录可以说使用Steam++或者uu加速器

    






