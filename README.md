# Bluefin
###(formerly OctoPygmy)

[![Build Status](https://travis-ci.org/bluefin-octopusdeploy/chrome-extension.svg?branch=master)](https://travis-ci.org/bluefin-octopusdeploy/chrome-extension) [![gitter.im](https://img.shields.io/gitter/room/gitterHQ/gitter.svg)](https://gitter.im/bluefin-octopusdeploy/chrome-extension)

[![Build status](https://ci.appveyor.com/api/projects/status/8e7fro2k7oh6f6x8/branch/master?svg=true)](https://ci.appveyor.com/project/BluefinOctopusDeploy/chrome-extension/branch/master)
> AppVeyor build/browser tests still in development

A small Chrome extension for Octopus Deploy to provide some additional functions to the user interface.

Get it from the Chrome web store [Bluefin Extension]

**Note: I am not affiliated with Octopus Deploy. This is an independent project.**

##### Currently working
 - Dashboard project collapser
 - [Environment collapser]
 - [Filter machines by role or name]
 - Filter machines by state (online, offline, disabled, etc...)
 - [Community Library integrated into step template library view] - _natively supported in Octopus since 3.7.0_
 - [Update step template across all projects]
 - [Clone step] - _natively supported in Octopus since 3.7.16_
 - Edit step as JSON
 - View resultant variable list on project variables page - _natively supported in Octopus since 3.4.0_
 - View Deployment Process for Release

#### Browser tests
See the [spec/browser-tests/README](https://github.com/bluefin-octopusdeploy/chrome-extension/blob/BrowserTesting/spec/browser-tests/README.md)

#### Other project of note

There is another individual that has a project of Powershell cmdlets that you may also be interested in. Please note, I am not the author of that project.

[Octopus-Cmdlets]

#### Contributors

[Matt Richardson]

[Bluefin Extension]:https://chrome.google.com/webstore/detail/octopygmy/gmnfhfdbcadjmpoigffmoondjhblabom?hl=en-US&gl=US
[Octopus-Cmdlets]:https://github.com/Swoogan/Octopus-Cmdlets
[Update step template across all projects]:https://octopusdeploy.uservoice.com/forums/170787-general/suggestions/6072178-when-updating-a-step-template-update-across-all
[Environment Collapser]:https://octopusdeploy.uservoice.com/forums/170787-general/suggestions/6150522-collapsible-environment-tabs
[Filter machines by role or name]:https://octopusdeploy.uservoice.com/forums/170787-general/suggestions/6697488-filter-machines-by-role-and-or-name
[Community Library integrated into step template library view]:https://octopusdeploy.uservoice.com/forums/170787-general/suggestions/6994715-tighter-integration-between-step-templates-and-com
[Clone step]:https://octopusdeploy.uservoice.com/forums/170787-general/suggestions/6470009-cloning-of-steps
[Matt Richardson]:https://github.com/matt-richardson
