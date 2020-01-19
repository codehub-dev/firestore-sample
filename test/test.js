"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path='../node_modules/mocha-typescript/globals.d.ts' />
const firebase = require("@firebase/testing");
const fs = require("fs");
/*
 * ============
 *    Setup
 * ============
 */
const projectId = "firestore-emulator-example";
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectId}:ruleCoverage.html`;
const rules = fs.readFileSync("firestore.rules", "utf8");
/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
function authedApp(auth) {
    return firebase
        .initializeTestApp({ projectId, auth })
        .firestore();
}
/*
 * ============
 *  Test Cases
 * ============
 */
before(() => __awaiter(this, void 0, void 0, function* () {
    yield firebase.loadFirestoreRules({ projectId, rules });
}));
beforeEach(() => __awaiter(this, void 0, void 0, function* () {
    // Clear the database between tests
    yield firebase.clearFirestoreData({ projectId });
}));
after(() => __awaiter(this, void 0, void 0, function* () {
    yield Promise.all(firebase.apps().map(app => app.delete()));
    console.log(`View rule coverage information at ${coverageUrl}\n`);
}));
let MyApp = class MyApp {
    "require users to log in before creating a profile"() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = authedApp(null);
            const profile = db.collection("users").doc("alice");
            yield firebase.assertFails(profile.set({ birthday: "January 1" }));
        });
    }
    "should enforce the createdAt date in user profiles"() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = authedApp({ uid: "alice" });
            const profile = db.collection("users").doc("alice");
            yield firebase.assertFails(profile.set({ birthday: "January 1" }));
            yield firebase.assertSucceeds(profile.set({
                birthday: "January 1",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }));
        });
    }
    "should only let users create their own profile"() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = authedApp({ uid: "alice" });
            yield firebase.assertSucceeds(db
                .collection("users")
                .doc("alice")
                .set({
                birthday: "January 1",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }));
            yield firebase.assertFails(db
                .collection("users")
                .doc("bob")
                .set({
                birthday: "January 1",
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }));
        });
    }
    "should let anyone read any profile"() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = authedApp(null);
            const profile = db.collection("users").doc("alice");
            yield firebase.assertSucceeds(profile.get());
        });
    }
    "should let anyone create a room"() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = authedApp({ uid: "alice" });
            const room = db.collection("rooms").doc("firebase");
            yield firebase.assertSucceeds(room.set({
                owner: "alice",
                topic: "All Things Firebase"
            }));
        });
    }
    "should force people to name themselves as room owner when creating a room"() {
        return __awaiter(this, void 0, void 0, function* () {
            const db = authedApp({ uid: "alice" });
            const room = db.collection("rooms").doc("firebase");
            yield firebase.assertFails(room.set({
                owner: "scott",
                topic: "Firebase Rocks!"
            }));
        });
    }
    "should not let one user steal a room from another user"() {
        return __awaiter(this, void 0, void 0, function* () {
            const alice = authedApp({ uid: "alice" });
            const bob = authedApp({ uid: "bob" });
            yield firebase.assertSucceeds(bob
                .collection("rooms")
                .doc("snow")
                .set({
                owner: "bob",
                topic: "All Things Snowboarding"
            }));
            yield firebase.assertFails(alice
                .collection("rooms")
                .doc("snow")
                .set({
                owner: "alice",
                topic: "skiing > snowboarding"
            }));
        });
    }
};
__decorate([
    test
], MyApp.prototype, "require users to log in before creating a profile", null);
__decorate([
    test
], MyApp.prototype, "should enforce the createdAt date in user profiles", null);
__decorate([
    test
], MyApp.prototype, "should only let users create their own profile", null);
__decorate([
    test
], MyApp.prototype, "should let anyone read any profile", null);
__decorate([
    test
], MyApp.prototype, "should let anyone create a room", null);
__decorate([
    test
], MyApp.prototype, "should force people to name themselves as room owner when creating a room", null);
__decorate([
    test
], MyApp.prototype, "should not let one user steal a room from another user", null);
MyApp = __decorate([
    suite
], MyApp);
//# sourceMappingURL=test.js.map