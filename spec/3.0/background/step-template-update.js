describe("step-template-update", function() {
  var originalConsoleDebug;
  var originalConsoleLog;

  beforeEach(function() {
    originalConsoleDebug = console.debug;
    originalConsoleLog = console.log;
    console.debug = function() {};
    console.log = function() {};
    methodCalled = "none";
    idsUpdated = [];
    idsManual = [];
    process = {};
  });

  afterEach(function() {
    console.debug = originalConsoleDebug;
    console.log = originalConsoleLog
  })

  describe("when updating the actions", function() {
    var template;
    
    beforeEach(function() {
      var process = getProcessWithMultipleUpdateableActions();
      template = getTemplateWithNewParameterHavingADefaultValue();
      
      pygmy3_0.stepTemplateUpdate.updateDeploymentProcessTemplate("root", process, template, sender, updated, manualUpdate, noUpdate);
    });
    
    it("notes the process as being updated", function() {
      expect(methodCalled).toEqual("updated");
    });
    
    it("marks the actions that were updated", function() {
      expect(idsUpdated).toContain("1");
      expect(idsUpdated).toContain("2");
      expect(idsUpdated.length).toEqual(2);
    });
    
    it("updates the template meta data in use", function() {
      expect(process.Steps[0].Actions[0].Properties["Octopus.Action.Template.Version"]).toEqual("2");
    });
    
    it("copies the action RunOnServer property", function() {
      expect(process.Steps[0].Actions[0].Properties["Octopus.Action.RunOnServer"]).toEqual("true");
    });
    
    it("copies the action MaxParallelism property", function() {
      expect(process.Steps[0].Actions[0].Properties["Octopus.Action.MaxParallelism"]).toEqual("2");
    });
    
    it("copies the property values from the original action", function() {
      expect(process.Steps[0].Actions[0].Properties.FirstParameter).toEqual("First value");
      expect(process.Steps[0].Actions[0].Properties.SecondParameter).toEqual("Second value");
    });
    
    it("copies the sensitive properties from the template only", function() {
      expect(process.Steps[0].Actions[0].SensitiveProperties).toEqual(template.SensitiveProperties);
    });
    
    it("copies the template's non-parameter properties to the action", function() {
      expect(process.Steps[0].Actions[0].Properties["Octopus.Test.Property"]).toBeDefined();
    });
    
    it("adds the new parameter with the default value", function() {
      expect(process.Steps[0].Actions[0].Properties.ThirdParameter).toEqual("Third default");
    });
  });
  
  it("updates child step action version number", function() {
      var process = getProcessWithOneOutOfDateStepInChildStep();
      template = getTemplateWithNewParameterHavingADefaultValue();
      
      pygmy3_0.stepTemplateUpdate.updateDeploymentProcessTemplate("root", process, template, sender, updated, manualUpdate, noUpdate);
      
      expect(process.Steps[0].Actions[1].Properties["Octopus.Action.Template.Version"]).toEqual("2");
  });
  
  it("does nothing when process already has latest template", function() {
    var process = getProcessWithUpToDateActions();
    var template = getTemplateHavingDefaultValuesAndNoNewParameters();
    
    pygmy3_0.stepTemplateUpdate.updateDeploymentProcessTemplate("root", process, template, sender, updated, manualUpdate, noUpdate);
    
    expect(methodCalled).toEqual("noUpdate");
  });

  it("notes the process as only needing manual updates when new parameter has no default value", function() {
    var process = getProcessWithMultipleUpdateableActions();
    var template = getTemplateWithNewParameterHavingNoDefaultValue();
    
    pygmy3_0.stepTemplateUpdate.updateDeploymentProcessTemplate("root", process, template, sender, updated, manualUpdate, noUpdate);
    
    expect(methodCalled).toEqual("manualUpdate");
  });
  
  it("marks only the specific actions to be manually updated", function() {
    var process = getProcessWithOneOutOfDateStep();
    var template = getTemplateWithExistingParameterHavingNoDefaultValue();
    
    pygmy3_0.stepTemplateUpdate.updateDeploymentProcessTemplate("root", process, template, sender, updated, manualUpdate, noUpdate);
    
    expect(idsManual).toContain("3");
    expect(idsManual.length).toEqual(1);
  });
  
  // Plumbing
  var sender = {};
  var methodCalled;
  var idsUpdated;
  var idsManual;
  var process;
  
  var updated = function(p, u, m) { methodCalled = "updated"; idsUpdated = u; idsManual = m; process = p };
  var manualUpdate = function(p, m) { methodCalled = "manualUpdate"; idsManual = m; process = p };
  var noUpdate = function(p) { methodCalled = "noUpdate"; process = p };
  
  function getTemplateHavingDefaultValuesAndNoNewParameters()
  {
    var template = {
      Id: "123",
      Version: "2",
      Parameters: [
        { Name: "FirstParameter", DefaultValue: "First default" },
        { Name: "SecondParameter", DefaultValue: "Second default" }
      ],
      Properties: {
        "Octopus.Test.Property": "Test value"
      },
      SensitiveProperties: {
        "Octopus.Sensitive.Test.Property": "abcdefg"
      }
    };
    
    return template;
  }
  
  function getTemplateWithExistingParameterHavingNoDefaultValue()
  {
    var template = getTemplateHavingDefaultValuesAndNoNewParameters();
    template.Parameters[1].DefaultValue = null;
    return template;
  }

  function getTemplateWithNewParameterHavingADefaultValue()
  {
    var template = getTemplateHavingDefaultValuesAndNoNewParameters();
    template.Parameters.push({ Name: "ThirdParameter", DefaultValue: "Third default" });
    return template;
  }
  
  function getTemplateWithNewParameterHavingNoDefaultValue()
  {
    var template = getTemplateHavingDefaultValuesAndNoNewParameters();
    template.Parameters.push({ Name: "ThirdParameter" });
    return template;
  }
  
  function getProcessWithUpToDateActions()
  {
    var process = getProcessWithMultipleUpdateableActions();
    _.each(process.Steps, function(step) { step.Actions[0].Properties["Octopus.Action.Template.Version"] = "2" });
    return process;
  }
  
  function getProcessWithOneOutOfDateStep()
  {
    var process = getProcessWithUpToDateActions();
    
    var newStep = { Properties: {}, Actions: [ { Id: "3", Name: "Act3", Properties: {} } ] };
    newStep.Actions[0].Properties.FirstParameter = "First value";
    newStep.Actions[0].Properties["Octopus.Action.Template.Id"] = "123";
    newStep.Actions[0].Properties["Octopus.Action.Template.Version"] = "1";
    process.Steps.push(newStep);
    
    return process;
  }
  
  function getProcessWithOneOutOfDateStepInChildStep()
  {
    var process = getProcessWithUpToDateActions();
    
    process.Steps[0].Actions.push({
        Id: "12", Name: "Action12",
        Properties: {
            "Octopus.Action.Template.Id": "123",
            "Octopus.Action.Template.Version": "1",
            "FirstParameter": "First value"
        }
    });
    
    return process;
  }
  
  function getProcessWithMultipleUpdateableActions()
  {
    var process = {
        Steps: [ { Properties: {}, Actions: [ { Id: "1", Name: "Act1" } ] }, { Properties: {}, Actions: [ { Id: "2", Name: "Act2" } ] } ]
    };

    process.Steps[0].Properties["Octopus.Action.TargetRoles"] = "role1,role2";
    var properties = process.Steps[0].Actions[0].Properties = {};
    properties.FirstParameter = "First value";
    properties.SecondParameter = "Second value";
    properties["Octopus.Action.Template.Id"] = "123";
    properties["Octopus.Action.Template.Version"] = "1";
    properties["Octopus.Action.MaxParallelism"] = "2";
    properties["Octopus.Action.RunOnServer"] = "true";
    
    process.Steps[1].Properties["Octopus.Action.TargetRoles"] = "role1,role2";
    properties = process.Steps[1].Actions[0].Properties = {};
    properties.FirstParameter = "Other value";
    properties.SecondParameter = "Original value";
    properties["Octopus.Action.Template.Id"] = "123";
    properties["Octopus.Action.Template.Version"] = "1";
    properties["Octopus.Action.MaxParallelism"] = "5";
    
    return process;
  };
});

