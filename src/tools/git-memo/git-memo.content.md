# Git 备忘录

## 配置

设置全局配置

```shell
git config --global user.name "[name]"
git config --global user.email "[email]"
```

## 快速开始

创建 git 仓库

```shell
git init
```

克隆现有 git 仓库

```shell
git clone [url]
```

## 提交

提交所有已跟踪的更改

```shell
git commit -am "[commit message]"
```

将新的修改添加到上一次提交

```shell
git commit --amend --no-edit
```

## I’ve made a mistake

Change last commit message

```shell
git commit --amend
```

Undo most recent commit and keep changes

```shell
git reset HEAD~1
```

Undo the `N` most recent commit and keep changes

```shell
git reset HEAD~N
```

Undo most recent commit and get rid of changes

```shell
git reset HEAD~1 --hard
```

Reset branch to remote state

```shell
git fetch origin
git reset --hard origin/[branch-name]
```

## 其他

将本地 master 分支重命名为 main

```shell
git branch -m master main
```
