"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registry = void 0;
var proto_signing_1 = require("@cosmjs/proto-signing");
var tx_1 = require("cosmjs-types/cosmos/bank/v1beta1/tx");
var tx_2 = require("cosmjs-types/cosmos/distribution/v1beta1/tx");
var tx_3 = require("cosmjs-types/cosmos/gov/v1beta1/tx");
var tx_4 = require("cosmjs-types/cosmos/staking/v1beta1/tx");
var tx_5 = require("cosmjs-types/ibc/applications/transfer/v1/tx");
var tx_6 = require("cosmjs-types/ibc/core/channel/v1/tx");
var tx_7 = require("cosmjs-types/ibc/core/client/v1/tx");
var tx_8 = require("cosmjs-types/ibc/core/connection/v1/tx");
var defaultRegistryTypes = [
    ["/cosmos.bank.v1beta1.MsgMultiSend", tx_1.MsgMultiSend],
    ["/cosmos.distribution.v1beta1.MsgFundCommunityPool", tx_2.MsgFundCommunityPool],
    ["/cosmos.distribution.v1beta1.MsgSetWithdrawAddress", tx_2.MsgSetWithdrawAddress],
    [
        "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
        tx_2.MsgWithdrawDelegatorReward,
    ],
    [
        "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
        tx_2.MsgWithdrawValidatorCommission,
    ],
    ["/cosmos.gov.v1beta1.MsgDeposit", tx_3.MsgDeposit],
    ["/cosmos.gov.v1beta1.MsgSubmitProposal", tx_3.MsgSubmitProposal],
    ["/cosmos.gov.v1beta1.MsgVote", tx_3.MsgVote],
    ["/cosmos.staking.v1beta1.MsgBeginRedelegate", tx_4.MsgBeginRedelegate],
    ["/cosmos.staking.v1beta1.MsgCreateValidator", tx_4.MsgCreateValidator],
    ["/cosmos.staking.v1beta1.MsgDelegate", tx_4.MsgDelegate],
    ["/cosmos.staking.v1beta1.MsgEditValidator", tx_4.MsgEditValidator],
    ["/cosmos.staking.v1beta1.MsgUndelegate", tx_4.MsgUndelegate],
    ["/ibc.core.channel.v1.MsgChannelOpenInit", tx_6.MsgChannelOpenInit],
    ["/ibc.core.channel.v1.MsgChannelOpenTry", tx_6.MsgChannelOpenTry],
    ["/ibc.core.channel.v1.MsgChannelOpenAck", tx_6.MsgChannelOpenAck],
    ["/ibc.core.channel.v1.MsgChannelOpenConfirm", tx_6.MsgChannelOpenConfirm],
    ["/ibc.core.channel.v1.MsgChannelCloseInit", tx_6.MsgChannelCloseInit],
    ["/ibc.core.channel.v1.MsgChannelCloseConfirm", tx_6.MsgChannelCloseConfirm],
    ["/ibc.core.channel.v1.MsgRecvPacket", tx_6.MsgRecvPacket],
    ["/ibc.core.channel.v1.MsgTimeout", tx_6.MsgTimeout],
    ["/ibc.core.channel.v1.MsgTimeoutOnClose", tx_6.MsgTimeoutOnClose],
    ["/ibc.core.channel.v1.MsgAcknowledgement", tx_6.MsgAcknowledgement],
    ["/ibc.core.client.v1.MsgCreateClient", tx_7.MsgCreateClient],
    ["/ibc.core.client.v1.MsgUpdateClient", tx_7.MsgUpdateClient],
    ["/ibc.core.client.v1.MsgUpgradeClient", tx_7.MsgUpgradeClient],
    ["/ibc.core.client.v1.MsgSubmitMisbehaviour", tx_7.MsgSubmitMisbehaviour],
    ["/ibc.core.connection.v1.MsgConnectionOpenInit", tx_8.MsgConnectionOpenInit],
    ["/ibc.core.connection.v1.MsgConnectionOpenTry", tx_8.MsgConnectionOpenTry],
    ["/ibc.core.connection.v1.MsgConnectionOpenAck", tx_8.MsgConnectionOpenAck],
    [
        "/ibc.core.connection.v1.MsgConnectionOpenConfirm",
        tx_8.MsgConnectionOpenConfirm,
    ],
    ["/ibc.applications.transfer.v1.MsgTransfer", tx_5.MsgTransfer],
];
exports.registry = new proto_signing_1.Registry(defaultRegistryTypes);
//# sourceMappingURL=defaultRegistryTypes.js.map