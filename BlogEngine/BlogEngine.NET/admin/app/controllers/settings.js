﻿angular.module('blogAdmin').controller('SettingsController', ["$rootScope", "$scope", "$location", "$log", "$http", "dataService", function ($rootScope, $scope, $location, $log, $http, dataService) {
    $scope.vm = {};
    $scope.settings = {};
    $scope.lookups = {};
    $scope.UserVars = UserVars;
    $scope.SiteVars = SiteVars;
    $scope.selfRegistrationInitialRole = {};
    $scope.ServerTime = moment(ServerTime).format("YYYY-MM-DD HH:mm");
    $scope.UtcTime = moment(UtcTime).format("YYYY-MM-DD HH:mm");
    $scope.singleUserBlog = SingleUserBlog;

    $scope.moderationEnabled = 0;
    $scope.commentsProvider = 0;

    $scope.commentsPerPageOptions = [
        { "OptionName": "5", "OptionValue": "5", "IsSelected": false },
        { "OptionName": "10", "OptionValue": "10", "IsSelected": false },
        { "OptionName": "15", "OptionValue": "15", "IsSelected": false },
        { "OptionName": "20", "OptionValue": "20", "IsSelected": false },
        { "OptionName": "50", "OptionValue": "50", "IsSelected": false }
    ];
    $scope.whiteListOptions = [
        { "OptionName": "0", "OptionValue": "0", "IsSelected": false },
        { "OptionName": "1", "OptionValue": "1", "IsSelected": false },
        { "OptionName": "2", "OptionValue": "2", "IsSelected": false },
        { "OptionName": "3", "OptionValue": "3", "IsSelected": false },
        { "OptionName": "4", "OptionValue": "4", "IsSelected": false },
        { "OptionName": "5", "OptionValue": "5", "IsSelected": false }
    ];
    $scope.blackListOptions = [
        { "OptionName": "0", "OptionValue": "0", "IsSelected": false },
        { "OptionName": "1", "OptionValue": "1", "IsSelected": false },
        { "OptionName": "2", "OptionValue": "2", "IsSelected": false },
        { "OptionName": "3", "OptionValue": "3", "IsSelected": false },
        { "OptionName": "4", "OptionValue": "4", "IsSelected": false },
        { "OptionName": "5", "OptionValue": "5", "IsSelected": false }
    ];
    $scope.timeZoneOptions = [];

    $scope.load = function () {
        spinOn();
        dataService.getItems('/api/lookups')
        .success(function (data) {
            angular.copy(data, $scope.lookups);
            $scope.loadSettings();
        })
        .error(function () {
            toastr.error($rootScope.lbl.errorLoadingSettings);
            spinOff();
        });
    }

    $scope.loadSettings = function () {
        dataService.getItems('/api/settings')
        .success(function (data) {
            angular.copy(data, $scope.vm);
            $scope.settings = $scope.vm.Settings;
            $scope.timeZoneOptions = $scope.vm.TimeZones;
            $scope.selectedLanguage = selectedOption($scope.lookups.Cultures, $scope.settings.Culture);
            $scope.selectedDeskTheme = selectedOption($scope.lookups.InstalledThemes, $scope.settings.DesktopTheme);
            $scope.selfRegistrationInitialRole = selectedOption($scope.lookups.SelfRegisterRoles, $scope.settings.SelfRegistrationInitialRole);
            $scope.selFeedFormat = selectedOption($scope.vm.FeedOptions, $scope.settings.SyndicationFormat);
            $scope.selCloseDays = selectedOption($scope.vm.CloseDaysOptions, $scope.settings.DaysCommentsAreEnabled);
            $scope.selCommentsPerPage = selectedOption($scope.commentsPerPageOptions, $scope.settings.CommentsPerPage);
            $scope.selTimeZone = selectedOption($scope.timeZoneOptions, $scope.settings.TimeZoneId);
            $scope.whiteListSelected = selectedOption($scope.whiteListOptions, $scope.settings.CommentWhiteListCount);
            $scope.blackListSelected = selectedOption($scope.blackListOptions, $scope.settings.CommentBlackListCount);       
            spinOff();
        })
        .error(function () {
            toastr.error($rootScope.lbl.errorLoadingSettings);
            spinOff();
        });
    }

    $scope.save = function () {
        if (!$('#form').valid()) {
            return false;
        }
        $scope.settings.DesktopTheme = $scope.selectedDeskTheme.OptionValue;
        $scope.settings.Culture = $scope.selectedLanguage.OptionValue;
        if ($scope.selfRegistrationInitialRole) {
            $scope.settings.SelfRegistrationInitialRole = $scope.selfRegistrationInitialRole.OptionValue;
        }
        $scope.settings.SyndicationFormat = $scope.selFeedFormat.OptionValue;
        $scope.settings.DaysCommentsAreEnabled = $scope.selCloseDays.OptionValue;
        $scope.settings.CommentsPerPage = $scope.selCommentsPerPage.OptionValue;
        $scope.settings.TimeZoneId = $scope.selTimeZone.OptionValue;

        $scope.settings.CommentWhiteListCount = $scope.whiteListSelected.OptionValue;
        $scope.settings.CommentBlackListCount = $scope.blackListSelected.OptionValue;

        $scope.settings.txtErrorTitle = $scope.txtErrorTitle;

        dataService.updateItem("/api/settings", $scope.settings)
        .success(function (data) {
            toastr.success($rootScope.lbl.settingsUpdated);
            $scope.load();
        })
        .error(function () { toastr.error($rootScope.lbl.updateFailed); });
    }

    $scope.exportToXml = function() {
        location.href = SiteVars.ApplicationRelativeWebRoot + 'blogml.axd';
    }

    $scope.importClickOnce = function () {
        var url = 'http://dotnetblogengine.net/clickonce/blogimporter/blog.importer.application?url=';
        url += SiteVars.AbsoluteWebRoot + '&username=' + UserVars.Name;
        location.href = url;
    }

    $(document).ready(function () {
        $('#form').validate({
            rules: {
                txtName: { required: true },
                txtTimeOffset: { required: true, number: true },
                txtPostsPerPage: { required: true, number: true },
                txtDescriptionCharacters: { required: true, number: true },
                txtDescriptionCharactersForPosts: { required: true, number: true },
                txtRemoteFileDownloadTimeout: { required: true, number: true },
                txtRemoteMaxFileSize: { required: true, number: true },
                txtFeedAuthor: { email: true },
                txtEndorsement: { url: true },
                txtAlternateFeedUrl: { url: true },
                txtpostsPerFeed: { number: true },
                txtEmail: { email: true },
                txtSmtpServerPort: { number: true },
                txtThemeCookieName: { required: true }
            }
        });
    });

    $scope.uploadFile = function(files) {
        var fd = new FormData();
        fd.append("file", files[0]);

        dataService.uploadFile("/api/upload?action=import", fd)
        .success(function (data) {
            toastr.success($rootScope.lbl.importedFromBlogML);
        })
        .error(function () { toastr.error($rootScope.lbl.importFailed); });
    }

    $scope.testEmail = function () {
        dataService.updateItem("/api/settings?action=testEmail", $scope.settings)
        .success(function (data) {
            if (data) {
                toastr.error(data);
            }
            else {
                toastr.success($rootScope.lbl.completed);
            }
        })
        .error(function () { toastr.error($rootScope.lbl.failed); });
    }

    $scope.load();

    $scope.loadTheme = function () {
        var theme = $("#selDesktopTheme option:selected").text();
        window.location.assign("#/shared/package?id=" + theme);
    }
}]);