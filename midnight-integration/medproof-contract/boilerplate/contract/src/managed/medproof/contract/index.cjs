'use strict';
const __compactRuntime = require('@midnight-ntwrk/compact-runtime');
const expectedRuntimeVersionString = '0.9.0';
const expectedRuntimeVersion = expectedRuntimeVersionString.split('-')[0].split('.').map(Number);
const actualRuntimeVersion = __compactRuntime.versionString.split('-')[0].split('.').map(Number);
if (expectedRuntimeVersion[0] != actualRuntimeVersion[0]
     || (actualRuntimeVersion[0] == 0 && expectedRuntimeVersion[1] != actualRuntimeVersion[1])
     || expectedRuntimeVersion[1] > actualRuntimeVersion[1]
     || (expectedRuntimeVersion[1] == actualRuntimeVersion[1] && expectedRuntimeVersion[2] > actualRuntimeVersion[2]))
   throw new __compactRuntime.CompactError(`Version mismatch: compiled code expects ${expectedRuntimeVersionString}, runtime is ${__compactRuntime.versionString}`);
{ const MAX_FIELD = 52435875175126190479447740508185965837690552500527637822603658699938581184512n;
  if (__compactRuntime.MAX_FIELD !== MAX_FIELD)
     throw new __compactRuntime.CompactError(`compiler thinks maximum field value is ${MAX_FIELD}; run time thinks it is ${__compactRuntime.MAX_FIELD}`)
}

const _descriptor_0 = new __compactRuntime.CompactTypeUnsignedInteger(18446744073709551615n, 8);

const _descriptor_1 = new __compactRuntime.CompactTypeBytes(32);

const _descriptor_2 = new __compactRuntime.CompactTypeUnsignedInteger(255n, 1);

const _descriptor_3 = new __compactRuntime.CompactTypeUnsignedInteger(1n, 1);

class _MedicalProof_0 {
  alignment() {
    return _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment().concat(_descriptor_0.alignment().concat(_descriptor_3.alignment().concat(_descriptor_3.alignment()))))))))));
  }
  fromValue(value_0) {
    return {
      studyId: _descriptor_1.fromValue(value_0),
      hospitalCommitment: _descriptor_1.fromValue(value_0),
      dataCommitment: _descriptor_1.fromValue(value_0),
      proofHash: _descriptor_1.fromValue(value_0),
      privacyLevel: _descriptor_2.fromValue(value_0),
      statisticalSignificance: _descriptor_3.fromValue(value_0),
      minimumSampleMet: _descriptor_3.fromValue(value_0),
      treatmentEffective: _descriptor_3.fromValue(value_0),
      timestamp: _descriptor_0.fromValue(value_0),
      verified: _descriptor_3.fromValue(value_0),
      regulatoryCompliant: _descriptor_3.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.studyId).concat(_descriptor_1.toValue(value_0.hospitalCommitment).concat(_descriptor_1.toValue(value_0.dataCommitment).concat(_descriptor_1.toValue(value_0.proofHash).concat(_descriptor_2.toValue(value_0.privacyLevel).concat(_descriptor_3.toValue(value_0.statisticalSignificance).concat(_descriptor_3.toValue(value_0.minimumSampleMet).concat(_descriptor_3.toValue(value_0.treatmentEffective).concat(_descriptor_0.toValue(value_0.timestamp).concat(_descriptor_3.toValue(value_0.verified).concat(_descriptor_3.toValue(value_0.regulatoryCompliant)))))))))));
  }
}

const _descriptor_4 = new _MedicalProof_0();

const _descriptor_5 = new __compactRuntime.CompactTypeBoolean();

const _descriptor_6 = new __compactRuntime.CompactTypeUnsignedInteger(65535n, 2);

const _descriptor_7 = new __compactRuntime.CompactTypeVector(6, _descriptor_1);

const _descriptor_8 = new __compactRuntime.CompactTypeVector(8, _descriptor_1);

const _descriptor_9 = new __compactRuntime.CompactTypeVector(4, _descriptor_1);

class _ContractAddress_0 {
  alignment() {
    return _descriptor_1.alignment();
  }
  fromValue(value_0) {
    return {
      bytes: _descriptor_1.fromValue(value_0)
    }
  }
  toValue(value_0) {
    return _descriptor_1.toValue(value_0.bytes);
  }
}

const _descriptor_10 = new _ContractAddress_0();

const _descriptor_11 = new __compactRuntime.CompactTypeUnsignedInteger(340282366920938463463374607431768211455n, 16);

class Contract {
  witnesses;
  constructor(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract constructor: expected 1 argument, received ${args_0.length}`);
    }
    const witnesses_0 = args_0[0];
    if (typeof(witnesses_0) !== 'object') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor is not an object');
    }
    if (typeof(witnesses_0.hospitalSecretKey) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named hospitalSecretKey');
    }
    if (typeof(witnesses_0.patientCount) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named patientCount');
    }
    if (typeof(witnesses_0.treatmentSuccess) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named treatmentSuccess');
    }
    if (typeof(witnesses_0.controlSuccess) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named controlSuccess');
    }
    if (typeof(witnesses_0.controlCount) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named controlCount');
    }
    if (typeof(witnesses_0.pValue) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named pValue');
    }
    if (typeof(witnesses_0.adverseEvents) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named adverseEvents');
    }
    if (typeof(witnesses_0.dataQualityScore) !== 'function') {
      throw new __compactRuntime.CompactError('first (witnesses) argument to Contract constructor does not contain a function-valued field named dataQualityScore');
    }
    this.witnesses = witnesses_0;
    this.circuits = {
      submitMedicalProof: (...args_1) => {
        if (args_1.length !== 4) {
          throw new __compactRuntime.CompactError(`submitMedicalProof: expected 4 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const studyId_0 = args_1[1];
        const hospitalId_0 = args_1[2];
        const privacyLevel_0 = args_1[3];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('submitMedicalProof',
                                      'argument 1 (as invoked from Typescript)',
                                      'medproof-fixed.compact line 119 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(studyId_0.buffer instanceof ArrayBuffer && studyId_0.BYTES_PER_ELEMENT === 1 && studyId_0.length === 32)) {
          __compactRuntime.type_error('submitMedicalProof',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'medproof-fixed.compact line 119 char 1',
                                      'Bytes<32>',
                                      studyId_0)
        }
        if (!(hospitalId_0.buffer instanceof ArrayBuffer && hospitalId_0.BYTES_PER_ELEMENT === 1 && hospitalId_0.length === 32)) {
          __compactRuntime.type_error('submitMedicalProof',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'medproof-fixed.compact line 119 char 1',
                                      'Bytes<32>',
                                      hospitalId_0)
        }
        if (!(typeof(privacyLevel_0) === 'bigint' && privacyLevel_0 >= 0n && privacyLevel_0 <= 255n)) {
          __compactRuntime.type_error('submitMedicalProof',
                                      'argument 3 (argument 4 as invoked from Typescript)',
                                      'medproof-fixed.compact line 119 char 1',
                                      'Uint<0..255>',
                                      privacyLevel_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(studyId_0).concat(_descriptor_1.toValue(hospitalId_0).concat(_descriptor_2.toValue(privacyLevel_0))),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment().concat(_descriptor_2.alignment()))
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._submitMedicalProof_0(context,
                                                    partialProofData,
                                                    studyId_0,
                                                    hospitalId_0,
                                                    privacyLevel_0);
        partialProofData.output = { value: _descriptor_1.toValue(result_0), alignment: _descriptor_1.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      authorizeHospital: (...args_1) => {
        if (args_1.length !== 3) {
          throw new __compactRuntime.CompactError(`authorizeHospital: expected 3 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const hospitalId_0 = args_1[1];
        const authorizationProof_0 = args_1[2];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('authorizeHospital',
                                      'argument 1 (as invoked from Typescript)',
                                      'medproof-fixed.compact line 255 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(hospitalId_0.buffer instanceof ArrayBuffer && hospitalId_0.BYTES_PER_ELEMENT === 1 && hospitalId_0.length === 32)) {
          __compactRuntime.type_error('authorizeHospital',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'medproof-fixed.compact line 255 char 1',
                                      'Bytes<32>',
                                      hospitalId_0)
        }
        if (!(authorizationProof_0.buffer instanceof ArrayBuffer && authorizationProof_0.BYTES_PER_ELEMENT === 1 && authorizationProof_0.length === 32)) {
          __compactRuntime.type_error('authorizeHospital',
                                      'argument 2 (argument 3 as invoked from Typescript)',
                                      'medproof-fixed.compact line 255 char 1',
                                      'Bytes<32>',
                                      authorizationProof_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(hospitalId_0).concat(_descriptor_1.toValue(authorizationProof_0)),
            alignment: _descriptor_1.alignment().concat(_descriptor_1.alignment())
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._authorizeHospital_0(context,
                                                   partialProofData,
                                                   hospitalId_0,
                                                   authorizationProof_0);
        partialProofData.output = { value: [], alignment: [] };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getStudyStatus: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getStudyStatus: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const studyId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getStudyStatus',
                                      'argument 1 (as invoked from Typescript)',
                                      'medproof-fixed.compact line 270 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(studyId_0.buffer instanceof ArrayBuffer && studyId_0.BYTES_PER_ELEMENT === 1 && studyId_0.length === 32)) {
          __compactRuntime.type_error('getStudyStatus',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'medproof-fixed.compact line 270 char 1',
                                      'Bytes<32>',
                                      studyId_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(studyId_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getStudyStatus_0(context,
                                                partialProofData,
                                                studyId_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getStudyCompliance: (...args_1) => {
        if (args_1.length !== 2) {
          throw new __compactRuntime.CompactError(`getStudyCompliance: expected 2 arguments (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        const studyId_0 = args_1[1];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getStudyCompliance',
                                      'argument 1 (as invoked from Typescript)',
                                      'medproof-fixed.compact line 280 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        if (!(studyId_0.buffer instanceof ArrayBuffer && studyId_0.BYTES_PER_ELEMENT === 1 && studyId_0.length === 32)) {
          __compactRuntime.type_error('getStudyCompliance',
                                      'argument 1 (argument 2 as invoked from Typescript)',
                                      'medproof-fixed.compact line 280 char 1',
                                      'Bytes<32>',
                                      studyId_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: {
            value: _descriptor_1.toValue(studyId_0),
            alignment: _descriptor_1.alignment()
          },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getStudyCompliance_0(context,
                                                    partialProofData,
                                                    studyId_0);
        partialProofData.output = { value: _descriptor_3.toValue(result_0), alignment: _descriptor_3.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getTotalStudies: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getTotalStudies: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getTotalStudies',
                                      'argument 1 (as invoked from Typescript)',
                                      'medproof-fixed.compact line 286 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getTotalStudies_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      },
      getVerifiedHospitals: (...args_1) => {
        if (args_1.length !== 1) {
          throw new __compactRuntime.CompactError(`getVerifiedHospitals: expected 1 argument (as invoked from Typescript), received ${args_1.length}`);
        }
        const contextOrig_0 = args_1[0];
        if (!(typeof(contextOrig_0) === 'object' && contextOrig_0.originalState != undefined && contextOrig_0.transactionContext != undefined)) {
          __compactRuntime.type_error('getVerifiedHospitals',
                                      'argument 1 (as invoked from Typescript)',
                                      'medproof-fixed.compact line 291 char 1',
                                      'CircuitContext',
                                      contextOrig_0)
        }
        const context = { ...contextOrig_0 };
        const partialProofData = {
          input: { value: [], alignment: [] },
          output: undefined,
          publicTranscript: [],
          privateTranscriptOutputs: []
        };
        const result_0 = this._getVerifiedHospitals_0(context, partialProofData);
        partialProofData.output = { value: _descriptor_0.toValue(result_0), alignment: _descriptor_0.alignment() };
        return { result: result_0, context: context, proofData: partialProofData };
      }
    };
    this.impureCircuits = {
      submitMedicalProof: this.circuits.submitMedicalProof,
      authorizeHospital: this.circuits.authorizeHospital,
      getStudyStatus: this.circuits.getStudyStatus,
      getStudyCompliance: this.circuits.getStudyCompliance,
      getTotalStudies: this.circuits.getTotalStudies,
      getVerifiedHospitals: this.circuits.getVerifiedHospitals
    };
  }
  initialState(...args_0) {
    if (args_0.length !== 1) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 1 argument (as invoked from Typescript), received ${args_0.length}`);
    }
    const constructorContext_0 = args_0[0];
    if (typeof(constructorContext_0) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'constructorContext' in argument 1 (as invoked from Typescript) to be an object`);
    }
    if (!('initialPrivateState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialPrivateState' in argument 1 (as invoked from Typescript)`);
    }
    if (!('initialZswapLocalState' in constructorContext_0)) {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript)`);
    }
    if (typeof(constructorContext_0.initialZswapLocalState) !== 'object') {
      throw new __compactRuntime.CompactError(`Contract state constructor: expected 'initialZswapLocalState' in argument 1 (as invoked from Typescript) to be an object`);
    }
    const state_0 = new __compactRuntime.ContractState();
    let stateValue_0 = __compactRuntime.StateValue.newArray();
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    stateValue_0 = stateValue_0.arrayPush(__compactRuntime.StateValue.newNull());
    state_0.data = stateValue_0;
    state_0.setOperation('submitMedicalProof', new __compactRuntime.ContractOperation());
    state_0.setOperation('authorizeHospital', new __compactRuntime.ContractOperation());
    state_0.setOperation('getStudyStatus', new __compactRuntime.ContractOperation());
    state_0.setOperation('getStudyCompliance', new __compactRuntime.ContractOperation());
    state_0.setOperation('getTotalStudies', new __compactRuntime.ContractOperation());
    state_0.setOperation('getVerifiedHospitals', new __compactRuntime.ContractOperation());
    const context = {
      originalState: state_0,
      currentPrivateState: constructorContext_0.initialPrivateState,
      currentZswapLocalState: constructorContext_0.initialZswapLocalState,
      transactionContext: new __compactRuntime.QueryContext(state_0.data, __compactRuntime.dummyContractAddress())
    };
    const partialProofData = {
      input: { value: [], alignment: [] },
      output: undefined,
      publicTranscript: [],
      privateTranscriptOutputs: []
    };
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(0n),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(1n),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                            alignment: _descriptor_0.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    Contract._query(context,
                    partialProofData,
                    [
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_2.toValue(2n),
                                                                            alignment: _descriptor_2.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newMap(
                                        new __compactRuntime.StateMap()
                                      ).encode() } },
                     { ins: { cached: false, n: 1 } }]);
    const tmp_0 = 0n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_2.toValue(0n),
                                                alignment: _descriptor_2.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_6.toValue(tmp_0),
                                              alignment: _descriptor_6.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    const tmp_1 = 0n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_2.toValue(1n),
                                                alignment: _descriptor_2.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_6.toValue(tmp_1),
                                              alignment: _descriptor_6.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    state_0.data = context.transactionContext.state;
    return {
      currentContractState: state_0,
      currentPrivateState: context.currentPrivateState,
      currentZswapLocalState: context.currentZswapLocalState
    }
  }
  _persistentHash_0(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_8, value_0);
    return result_0;
  }
  _persistentHash_1(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_9, value_0);
    return result_0;
  }
  _persistentHash_2(value_0) {
    const result_0 = __compactRuntime.persistentHash(_descriptor_7, value_0);
    return result_0;
  }
  _hospitalSecretKey_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.hospitalSecretKey(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(result_0.buffer instanceof ArrayBuffer && result_0.BYTES_PER_ELEMENT === 1 && result_0.length === 32)) {
      __compactRuntime.type_error('hospitalSecretKey',
                                  'return value',
                                  'medproof-fixed.compact line 48 char 1',
                                  'Bytes<32>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_1.toValue(result_0),
      alignment: _descriptor_1.alignment()
    });
    return result_0;
  }
  _patientCount_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.patientCount(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('patientCount',
                                  'return value',
                                  'medproof-fixed.compact line 49 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _treatmentSuccess_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.treatmentSuccess(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('treatmentSuccess',
                                  'return value',
                                  'medproof-fixed.compact line 50 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _controlSuccess_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.controlSuccess(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('controlSuccess',
                                  'return value',
                                  'medproof-fixed.compact line 51 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _controlCount_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.controlCount(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('controlCount',
                                  'return value',
                                  'medproof-fixed.compact line 52 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _pValue_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.pValue(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('pValue',
                                  'return value',
                                  'medproof-fixed.compact line 53 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _adverseEvents_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.adverseEvents(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('adverseEvents',
                                  'return value',
                                  'medproof-fixed.compact line 54 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _dataQualityScore_0(context, partialProofData) {
    const witnessContext_0 = __compactRuntime.witnessContext(ledger(context.transactionContext.state), context.currentPrivateState, context.transactionContext.address);
    const [nextPrivateState_0, result_0] = this.witnesses.dataQualityScore(witnessContext_0);
    context.currentPrivateState = nextPrivateState_0;
    if (!(typeof(result_0) === 'bigint' && result_0 >= 0n && result_0 <= 18446744073709551615n)) {
      __compactRuntime.type_error('dataQualityScore',
                                  'return value',
                                  'medproof-fixed.compact line 55 char 1',
                                  'Uint<0..18446744073709551615>',
                                  result_0)
    }
    partialProofData.privateTranscriptOutputs.push({
      value: _descriptor_0.toValue(result_0),
      alignment: _descriptor_0.alignment()
    });
    return result_0;
  }
  _generateHospitalCommitment_0(hospitalId_0, secretKey_0, studyId_0) {
    return this._persistentHash_1([new Uint8Array([109, 101, 100, 112, 114, 111, 111, 102, 58, 104, 111, 115, 112, 105, 116, 97, 108, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   hospitalId_0,
                                   secretKey_0,
                                   studyId_0]);
  }
  _generateDataCommitment_0(patCount_0,
                            treatSucc_0,
                            contSucc_0,
                            contCount_0,
                            pVal_0,
                            advEvents_0,
                            dataQual_0)
  {
    const patCountB_0 = __compactRuntime.convertFieldToBytes(32,
                                                             patCount_0,
                                                             'medproof-fixed.compact line 95 char 21');
    const treatSuccB_0 = __compactRuntime.convertFieldToBytes(32,
                                                              treatSucc_0,
                                                              'medproof-fixed.compact line 96 char 22');
    const contSuccB_0 = __compactRuntime.convertFieldToBytes(32,
                                                             contSucc_0,
                                                             'medproof-fixed.compact line 97 char 21');
    const contCountB_0 = __compactRuntime.convertFieldToBytes(32,
                                                              contCount_0,
                                                              'medproof-fixed.compact line 98 char 22');
    const pValB_0 = __compactRuntime.convertFieldToBytes(32,
                                                         pVal_0,
                                                         'medproof-fixed.compact line 99 char 17');
    const advEventsB_0 = __compactRuntime.convertFieldToBytes(32,
                                                              advEvents_0,
                                                              'medproof-fixed.compact line 100 char 22');
    const dataQualB_0 = __compactRuntime.convertFieldToBytes(32,
                                                             dataQual_0,
                                                             'medproof-fixed.compact line 101 char 21');
    return this._persistentHash_0([new Uint8Array([109, 101, 100, 112, 114, 111, 111, 102, 58, 100, 97, 116, 97, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
                                   patCountB_0,
                                   treatSuccB_0,
                                   contSuccB_0,
                                   contCountB_0,
                                   pValB_0,
                                   advEventsB_0,
                                   dataQualB_0]);
  }
  _submitMedicalProof_0(context,
                        partialProofData,
                        studyId_0,
                        hospitalId_0,
                        privacyLevel_0)
  {
    const patCount_0 = this._patientCount_0(context, partialProofData);
    const treatSucc_0 = this._treatmentSuccess_0(context, partialProofData);
    const contSucc_0 = this._controlSuccess_0(context, partialProofData);
    const contCount_0 = this._controlCount_0(context, partialProofData);
    const pVal_0 = this._pValue_0(context, partialProofData);
    const advEvents_0 = this._adverseEvents_0(context, partialProofData);
    const dataQual_0 = this._dataQualityScore_0(context, partialProofData);
    __compactRuntime.assert(patCount_0 >= 50n, 'Insufficient sample size');
    __compactRuntime.assert(pVal_0 <= 50n, 'Not statistically significant');
    __compactRuntime.assert(contCount_0 >= 20n, 'Insufficient control group');
    __compactRuntime.assert(dataQual_0 >= 80n, 'Data quality below threshold');
    const treatmentScaled_0 = treatSucc_0 * contCount_0;
    const controlScaled_0 = contSucc_0 * patCount_0;
    __compactRuntime.assert(treatmentScaled_0 > controlScaled_0,
                            'Treatment not superior to control');
    const improvement_0 = (__compactRuntime.assert(!(treatmentScaled_0
                                                     <
                                                     controlScaled_0),
                                                   'result of subtraction would be negative'),
                           treatmentScaled_0 - controlScaled_0);
    const minImprovement_0 = controlScaled_0 * 10n;
    __compactRuntime.assert(improvement_0 * 100n >= minImprovement_0,
                            'Clinically insignificant improvement');
    const adverseEventsScaled_0 = advEvents_0 * 100n;
    const safetyThreshold_0 = patCount_0 * 10n;
    __compactRuntime.assert(adverseEventsScaled_0 <= safetyThreshold_0,
                            'Excessive adverse events');
    const dataCommitment_0 = this._generateDataCommitment_0(patCount_0,
                                                            treatSucc_0,
                                                            contSucc_0,
                                                            contCount_0,
                                                            pVal_0,
                                                            advEvents_0,
                                                            dataQual_0);
    const hospitalCommitment_0 = this._generateHospitalCommitment_0(hospitalId_0,
                                                                    this._hospitalSecretKey_0(context,
                                                                                              partialProofData),
                                                                    studyId_0);
    const timestamp_0 = ((t1) => {
                          if (t1 > 18446744073709551615n) {
                            throw new __compactRuntime.CompactError('medproof-fixed.compact line 196 char 21: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
                          }
                          return t1;
                        })(_descriptor_0.fromValue(Contract._query(context,
                                                                   partialProofData,
                                                                   [
                                                                    { dup: { n: 0 } },
                                                                    { idx: { cached: false,
                                                                             pushPath: false,
                                                                             path: [
                                                                                    { tag: 'value',
                                                                                      value: { value: _descriptor_2.toValue(0n),
                                                                                               alignment: _descriptor_2.alignment() } }] } },
                                                                    { popeq: { cached: true,
                                                                               result: undefined } }]).value));
    const timestampB_0 = __compactRuntime.convertFieldToBytes(32,
                                                              timestamp_0,
                                                              'medproof-fixed.compact line 197 char 22');
    const privLevelB_0 = __compactRuntime.convertFieldToBytes(32,
                                                              privacyLevel_0,
                                                              'medproof-fixed.compact line 198 char 22');
    const proofHash_0 = this._persistentHash_2([studyId_0,
                                                hospitalId_0,
                                                dataCommitment_0,
                                                hospitalCommitment_0,
                                                privLevelB_0,
                                                timestampB_0]);
    const regulatoryCheck1_0 = patCount_0 >= 50n;
    const regulatoryCheck2_0 = pVal_0 <= 50n;
    const regulatoryCheck3_0 = dataQual_0 >= 80n;
    const regulatoryCheck4_0 = adverseEventsScaled_0 <= safetyThreshold_0;
    const regulatoryCompliant_0 = regulatoryCheck1_0 && regulatoryCheck2_0
                                  &&
                                  regulatoryCheck3_0
                                  &&
                                  regulatoryCheck4_0
                                  ?
                                  1n :
                                  0n;
    const proof_0 = { studyId: studyId_0,
                      hospitalCommitment: hospitalCommitment_0,
                      dataCommitment: dataCommitment_0,
                      proofHash: proofHash_0,
                      privacyLevel: privacyLevel_0,
                      statisticalSignificance: 1n,
                      minimumSampleMet: 1n,
                      treatmentEffective: 1n,
                      timestamp: timestamp_0,
                      verified: 1n,
                      regulatoryCompliant: regulatoryCompliant_0 };
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_2.toValue(2n),
                                                alignment: _descriptor_2.alignment() } }] } },
                     { push: { storage: false,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(studyId_0),
                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                     { push: { storage: true,
                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_4.toValue(proof_0),
                                                                            alignment: _descriptor_4.alignment() }).encode() } },
                     { ins: { cached: false, n: 1 } },
                     { ins: { cached: true, n: 1 } }]);
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_2.toValue(0n),
                                                alignment: _descriptor_2.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_6.toValue(tmp_0),
                                              alignment: _descriptor_6.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    return proofHash_0;
  }
  _authorizeHospital_0(context,
                       partialProofData,
                       hospitalId_0,
                       authorizationProof_0)
  {
    __compactRuntime.assert(!this._equal_0(authorizationProof_0,
                                           new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])),
                            'Invalid authorization');
    const tmp_0 = 1n;
    Contract._query(context,
                    partialProofData,
                    [
                     { idx: { cached: false,
                              pushPath: true,
                              path: [
                                     { tag: 'value',
                                       value: { value: _descriptor_2.toValue(1n),
                                                alignment: _descriptor_2.alignment() } }] } },
                     { addi: { immediate: parseInt(__compactRuntime.valueToBigInt(
                                            { value: _descriptor_6.toValue(tmp_0),
                                              alignment: _descriptor_6.alignment() }
                                              .value
                                          )) } },
                     { ins: { cached: true, n: 1 } }]);
    return [];
  }
  _getStudyStatus_0(context, partialProofData, studyId_0) {
    const hasMember_0 = _descriptor_5.fromValue(Contract._query(context,
                                                                partialProofData,
                                                                [
                                                                 { dup: { n: 0 } },
                                                                 { idx: { cached: false,
                                                                          pushPath: false,
                                                                          path: [
                                                                                 { tag: 'value',
                                                                                   value: { value: _descriptor_2.toValue(2n),
                                                                                            alignment: _descriptor_2.alignment() } }] } },
                                                                 { push: { storage: false,
                                                                           value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(studyId_0),
                                                                                                                        alignment: _descriptor_1.alignment() }).encode() } },
                                                                 'member',
                                                                 { popeq: { cached: true,
                                                                            result: undefined } }]).value);
    if (hasMember_0) {
      const proof_0 = _descriptor_4.fromValue(Contract._query(context,
                                                              partialProofData,
                                                              [
                                                               { dup: { n: 0 } },
                                                               { idx: { cached: false,
                                                                        pushPath: false,
                                                                        path: [
                                                                               { tag: 'value',
                                                                                 value: { value: _descriptor_2.toValue(2n),
                                                                                          alignment: _descriptor_2.alignment() } }] } },
                                                               { idx: { cached: false,
                                                                        pushPath: false,
                                                                        path: [
                                                                               { tag: 'value',
                                                                                 value: { value: _descriptor_1.toValue(studyId_0),
                                                                                          alignment: _descriptor_1.alignment() } }] } },
                                                               { popeq: { cached: false,
                                                                          result: undefined } }]).value);
      return proof_0.verified;
    } else {
      return 0n;
    }
  }
  _getStudyCompliance_0(context, partialProofData, studyId_0) {
    __compactRuntime.assert(_descriptor_5.fromValue(Contract._query(context,
                                                                    partialProofData,
                                                                    [
                                                                     { dup: { n: 0 } },
                                                                     { idx: { cached: false,
                                                                              pushPath: false,
                                                                              path: [
                                                                                     { tag: 'value',
                                                                                       value: { value: _descriptor_2.toValue(2n),
                                                                                                alignment: _descriptor_2.alignment() } }] } },
                                                                     { push: { storage: false,
                                                                               value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(studyId_0),
                                                                                                                            alignment: _descriptor_1.alignment() }).encode() } },
                                                                     'member',
                                                                     { popeq: { cached: true,
                                                                                result: undefined } }]).value),
                            'Study not found');
    const proof_0 = _descriptor_4.fromValue(Contract._query(context,
                                                            partialProofData,
                                                            [
                                                             { dup: { n: 0 } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_2.toValue(2n),
                                                                                        alignment: _descriptor_2.alignment() } }] } },
                                                             { idx: { cached: false,
                                                                      pushPath: false,
                                                                      path: [
                                                                             { tag: 'value',
                                                                               value: { value: _descriptor_1.toValue(studyId_0),
                                                                                        alignment: _descriptor_1.alignment() } }] } },
                                                             { popeq: { cached: false,
                                                                        result: undefined } }]).value);
    return proof_0.regulatoryCompliant;
  }
  _getTotalStudies_0(context, partialProofData) {
    return ((t1) => {
             if (t1 > 18446744073709551615n) {
               throw new __compactRuntime.CompactError('medproof-fixed.compact line 287 char 10: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
             }
             return t1;
           })(_descriptor_0.fromValue(Contract._query(context,
                                                      partialProofData,
                                                      [
                                                       { dup: { n: 0 } },
                                                       { idx: { cached: false,
                                                                pushPath: false,
                                                                path: [
                                                                       { tag: 'value',
                                                                         value: { value: _descriptor_2.toValue(0n),
                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                       { popeq: { cached: true,
                                                                  result: undefined } }]).value));
  }
  _getVerifiedHospitals_0(context, partialProofData) {
    return ((t1) => {
             if (t1 > 18446744073709551615n) {
               throw new __compactRuntime.CompactError('medproof-fixed.compact line 292 char 10: cast from Field or Uint value to smaller Uint value failed: ' + t1 + ' is greater than 18446744073709551615');
             }
             return t1;
           })(_descriptor_0.fromValue(Contract._query(context,
                                                      partialProofData,
                                                      [
                                                       { dup: { n: 0 } },
                                                       { idx: { cached: false,
                                                                pushPath: false,
                                                                path: [
                                                                       { tag: 'value',
                                                                         value: { value: _descriptor_2.toValue(1n),
                                                                                  alignment: _descriptor_2.alignment() } }] } },
                                                       { popeq: { cached: true,
                                                                  result: undefined } }]).value));
  }
  _equal_0(x0, y0) {
    if (!x0.every((x, i) => y0[i] === x)) { return false; }
    return true;
  }
  static _query(context, partialProofData, prog) {
    var res;
    try {
      res = context.transactionContext.query(prog, __compactRuntime.CostModel.dummyCostModel());
    } catch (err) {
      throw new __compactRuntime.CompactError(err.toString());
    }
    context.transactionContext = res.context;
    var reads = res.events.filter((e) => e.tag === 'read');
    var i = 0;
    partialProofData.publicTranscript = partialProofData.publicTranscript.concat(prog.map((op) => {
      if(typeof(op) === 'object' && 'popeq' in op) {
        return { popeq: {
          ...op.popeq,
          result: reads[i++].content,
        } };
      } else {
        return op;
      }
    }));
    if(res.events.length == 1 && res.events[0].tag === 'read') {
      return res.events[0].content;
    } else {
      return res.events;
    }
  }
}
function ledger(state) {
  const context = {
    originalState: state,
    transactionContext: new __compactRuntime.QueryContext(state, __compactRuntime.dummyContractAddress())
  };
  const partialProofData = {
    input: { value: [], alignment: [] },
    output: undefined,
    publicTranscript: [],
    privateTranscriptOutputs: []
  };
  return {
    get totalStudies() {
      return _descriptor_0.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_2.toValue(0n),
                                                                                 alignment: _descriptor_2.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    },
    get verifiedHospitals() {
      return _descriptor_0.fromValue(Contract._query(context,
                                                     partialProofData,
                                                     [
                                                      { dup: { n: 0 } },
                                                      { idx: { cached: false,
                                                               pushPath: false,
                                                               path: [
                                                                      { tag: 'value',
                                                                        value: { value: _descriptor_2.toValue(1n),
                                                                                 alignment: _descriptor_2.alignment() } }] } },
                                                      { popeq: { cached: true,
                                                                 result: undefined } }]).value);
    },
    registeredProofs: {
      isEmpty(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`isEmpty: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_2.toValue(2n),
                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                        'size',
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_0.toValue(0n),
                                                                                                               alignment: _descriptor_0.alignment() }).encode() } },
                                                        'eq',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      size(...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`size: expected 0 arguments, received ${args_0.length}`);
        }
        return _descriptor_0.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_2.toValue(2n),
                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                        'size',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      member(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`member: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('member',
                                      'argument 1',
                                      'medproof-fixed.compact line 42 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_5.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_2.toValue(2n),
                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                        { push: { storage: false,
                                                                  value: __compactRuntime.StateValue.newCell({ value: _descriptor_1.toValue(key_0),
                                                                                                               alignment: _descriptor_1.alignment() }).encode() } },
                                                        'member',
                                                        { popeq: { cached: true,
                                                                   result: undefined } }]).value);
      },
      lookup(...args_0) {
        if (args_0.length !== 1) {
          throw new __compactRuntime.CompactError(`lookup: expected 1 argument, received ${args_0.length}`);
        }
        const key_0 = args_0[0];
        if (!(key_0.buffer instanceof ArrayBuffer && key_0.BYTES_PER_ELEMENT === 1 && key_0.length === 32)) {
          __compactRuntime.type_error('lookup',
                                      'argument 1',
                                      'medproof-fixed.compact line 42 char 1',
                                      'Bytes<32>',
                                      key_0)
        }
        return _descriptor_4.fromValue(Contract._query(context,
                                                       partialProofData,
                                                       [
                                                        { dup: { n: 0 } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_2.toValue(2n),
                                                                                   alignment: _descriptor_2.alignment() } }] } },
                                                        { idx: { cached: false,
                                                                 pushPath: false,
                                                                 path: [
                                                                        { tag: 'value',
                                                                          value: { value: _descriptor_1.toValue(key_0),
                                                                                   alignment: _descriptor_1.alignment() } }] } },
                                                        { popeq: { cached: false,
                                                                   result: undefined } }]).value);
      },
      [Symbol.iterator](...args_0) {
        if (args_0.length !== 0) {
          throw new __compactRuntime.CompactError(`iter: expected 0 arguments, received ${args_0.length}`);
        }
        const self_0 = state.asArray()[2];
        return self_0.asMap().keys().map(  (key) => {    const value = self_0.asMap().get(key).asCell();    return [      _descriptor_1.fromValue(key.value),      _descriptor_4.fromValue(value.value)    ];  })[Symbol.iterator]();
      }
    }
  };
}
const _emptyContext = {
  originalState: new __compactRuntime.ContractState(),
  transactionContext: new __compactRuntime.QueryContext(new __compactRuntime.ContractState().data, __compactRuntime.dummyContractAddress())
};
const _dummyContract = new Contract({
  hospitalSecretKey: (...args) => undefined,
  patientCount: (...args) => undefined,
  treatmentSuccess: (...args) => undefined,
  controlSuccess: (...args) => undefined,
  controlCount: (...args) => undefined,
  pValue: (...args) => undefined,
  adverseEvents: (...args) => undefined,
  dataQualityScore: (...args) => undefined
});
const pureCircuits = {};
const contractReferenceLocations = { tag: 'publicLedgerArray', indices: { } };
exports.Contract = Contract;
exports.ledger = ledger;
exports.pureCircuits = pureCircuits;
exports.contractReferenceLocations = contractReferenceLocations;
//# sourceMappingURL=index.cjs.map
